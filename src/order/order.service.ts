import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentService } from 'src/department/deparment.service';
import { Department } from 'src/entity/department.entity';
import { Order } from 'src/entity/order.entity';
import { OrderDetail } from 'src/entity/order_detail.entity';
import { TABS_ORDER, getSubTotal, ranDomUID } from 'src/helper';
import { ProductService } from 'src/product/product.service';
import { StatusService } from 'src/status/status.service';
import { Equal, IsNull, Like, MoreThanOrEqual, Not, Repository } from 'typeorm';

@Injectable()
export class OrderService {
  private LEVEL_DONE = -1;
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderDetail)
    private orderDetailRepo: Repository<OrderDetail>,
    private readonly statusService: StatusService,
    private readonly productService: ProductService,
    private readonly departService: DepartmentService,
  ) {}

  private getLevelByIdDepartment(arr: any, deparmentID: string) {
    if (arr && deparmentID) {
      const check = arr.find(
        (itemLoop) =>
          itemLoop?.departmentID?.toLowerCase() === deparmentID.toLowerCase(),
      );

      return check?.level;
    }
    return null;
  }
  async getAll(body, request) {
    const userReq = request?.user;
    const departmentOfUserID = userReq?.department?.departID;

    const take = +body.rowsPerPage || 10;
    const page = +body.page || 0;
    const skip = page * take;
    const search = body.search || '';
    const fromDate = body.fromDate ? new Date(body.fromDate) : new Date();
    const toDate = body.toDate ? new Date(body.toDate) : new Date();

    const type = body?.type;
    //1 người duyệt có thể duyệt bộ phận mk hoặc bp khác

    // neu la tai khoan duyet order thi sao?
    //+ lay ra các bản ghi có status > level có trong phòng ban mk được duyêt
    //+
    //neu khong la tai khoan duyet order thi sao?
    //+
    // vi du: mr jung: New: level 1,accept:level: 2,ca
    //

    /**
     * - hiển thị: những đơn được hủy -> new level 1,Wait chưa done
     *
     *
     *tài khoản bt:
     *tất cả: những đơn của mk
     *đơn mới: status === new, đơn của mình đang chờ duyệt
     *đã duyệt: những đơn status = done
     * đã hủy: những đơn có cancel at
     *
     * Tài khoản người duyệt:
     *- hiển thị: new(những đơn của mk chưa done,những đơn mà level = level của mk - 1) accept(những đơn là >= level của mk)
     * tất cả:những đơn của mình, đơn mk cần phải duyệt(mới),đơn mình đã duyêt, đơn mình đã hủy
     * đơn mới: những đơn level = level của mình - 1, phòng mk được duyệt
     * đã duyệt: những đơn level >= level của mk,phòng mình được duyệt
     * đã hủy:những đơn hủy bởi mình,những đơn của mk bị hủy
     *
     *
     * tài khoản chi tinh:
     * tất cả:những đơn của mình(createBy), đơn mk cần phải duyệt(mới),đơn mình đã duyêt, đơn mình đã hủy
     * đơn mới:những đơn của mình, những đơn level max theo từ bộ phận
     * đã duyệt: những đơn của mình, những đơn level done
     * đã hủy: những đơn của mk hủy
     *
     *
     *
     * trường hợp tài khoản người duyệt cuối,
     * thì lấy những đơn level = max - 1,
     *
     *
     *
     */
    const maxValueOfMyDepart =
      await this.statusService.getMaxLevelByDepartment(departmentOfUserID);
    const userStatusFind = await this.statusService.getByUserID(userReq?.id);

    const selectOBJ = {
      orderID: true,
      code: true,
      departmentID: true,
      total: true,
      reciever: true,
      created_at: true,
      created_by: true,
      cancel_at: true,
      cancel_by: true,
      status: {
        statusID: true,
        statusName: true,
        userID: true,
        level: true,
      },
      department: {
        departID: true,
        departName: true,
      },
      orderDetail: {
        orderDetailID: true,
        product: {
          productID: true,
          productName: true,
        },
      },
    };
    let whereArr;
    //đối vói người có quyển duyệt: những đơn của mk thì ở trạng thái new
    //cho đến khi mrsTinh duyệt
    //những đơn đã duyệt

    if (userStatusFind?.length > 0) {
      const arrAll = [];
      const arrAccept = [];
      const arrNew = [];
      userStatusFind.map((item) => {
        arrAll.push({
          departmentID: item.departmentID,
          status: { level: MoreThanOrEqual(item.level - 1) },
          code: Like(`%${search}%`),
        });
        arrAccept.push({
          departmentID: item.departmentID,
          status: { level: MoreThanOrEqual(item.level) },
          code: Like(`%${search}%`),
        });
        arrNew.push({
          departmentID: item.departmentID,
          status: { level: item.level - 1 },
          code: Like(`%${search}%`),
        });
      });

      //nguoi duyet
      switch (type) {
        case TABS_ORDER.ALL_TAB: //get all record
          whereArr = [
            ...arrAll,
            { created_by: userReq?.username, code: Like(`%${search}%`) }, //đơn tạo bảo mk
            {
              // đơn hủy bởi mk
              cancel_by: userReq?.username,
              code: Like(`%${search}%`),
            }, //level = -1 thì là done
          ];
          break;
        case TABS_ORDER.ACCEPT_TAB:
          //trường hợp done của bản thân
          whereArr = arrAccept
            .map((item) => {
              return {
                ...item,
                created_by: Not(userReq?.username),
                code: Like(`%${search}%`),
              };
            })
            .concat([
              //trường hợp done của bản thân
              {
                created_by: userReq?.username,
                code: Like(`%${search}%`),
                status: {
                  level: maxValueOfMyDepart?.level,
                },
              },
            ]);
          break;
        case TABS_ORDER.NEW_TAB: // get all order status = new,level = 1
          //đơn mới có cả gồm những đơn của mk chưa done
          whereArr = arrNew.concat([
            {
              created_by: userReq?.username,
              status: { level: Not(maxValueOfMyDepart?.level) },
              code: Like(`%${search}%`),
            },
          ]);
          break;
        case TABS_ORDER.CANCEL_TAB:
          whereArr = [
            { cancel_by: userReq?.username, code: Like(`%${search}%`) },
          ];
          break;

        default:
          break;
      }
    } else {
      //lấy ra level max của bộ phận mk
      // nguoi binh thuong
      switch (type) {
        case TABS_ORDER.ALL_TAB: //get all my record
          whereArr = {
            created_by: userReq?.username,
            code: Like(`%${search}%`),
          };
          break;
        case TABS_ORDER.ACCEPT_TAB:
          //nhưng order hoàn thành -> level = -1
          whereArr = {
            created_by: userReq?.username,
            status: { level: maxValueOfMyDepart?.level },
            code: Like(`%${search}%`),
          };
          break;
        case TABS_ORDER.NEW_TAB: // get all order status = new,level = 0
          whereArr = {
            created_by: userReq?.username,
            status: { level: 0 },
            cancel_at: IsNull(), // chưa bị hủy
            code: Like(`%${search}%`),
          };
          break;
        case TABS_ORDER.CANCEL_TAB:
          whereArr = {
            created_by: userReq?.username,
            cancel_at: Not(IsNull()),
            code: Like(`%${search}%`),
          };
          break;

        default:
          break;
      }
    }

    const [result, total] = await this.orderRepo.findAndCount({
      select: selectOBJ,
      where: whereArr,
      relations: ['status', 'orderDetail', 'department', 'orderDetail.product'],
      order: { created_at: 'DESC' },
      take: take,
      skip: skip,
    });
    const dataNew = result.map((orderItem) => {
      if (orderItem?.cancel_at) {
        // đơn đã hủy
        return {
          ...orderItem,
          disable: { accept: false, cancel: false },
        };
      }
      //trường hợp done
      if (
        orderItem?.status?.level >= maxValueOfMyDepart?.level &&
        orderItem?.departmentID === departmentOfUserID
      ) {
        return {
          ...orderItem,
          disable: { accept: false, cancel: false },
        };
      }
      const levelFound = this.getLevelByIdDepartment(
        userStatusFind,
        orderItem?.departmentID,
      );
      // neu la nguoi duyet cua bp  + don cuar minh + status = status cua mk -> new
      if (orderItem?.created_by === userReq?.username) {
        let statusNameTemp = 'New';
        if (!levelFound) {
          if (orderItem?.status?.level > 0) {
            statusNameTemp = 'Wait';
          }
        } else {
          //nguowif cos quyen duyet trong bp cua mk
          //neu là đơn của mk thì đó là new
          if (orderItem?.status?.level > levelFound) {
            statusNameTemp = 'Wait';
          }
        }
        return {
          ...orderItem,
          status: { ...orderItem?.status, statusName: statusNameTemp },
          disable: { accept: false, cancel: true },
        };
      }
      const check = orderItem?.status?.level >= levelFound ? true : false;
      if (!check) {
        let nameStatus = 'New';
        // user bt mà có level != new -> Wait
        if (orderItem?.status?.level > 0 && userStatusFind?.length < 1) {
          nameStatus = 'Wait';
        }
        return {
          ...orderItem,
          status: { ...orderItem?.status, statusName: nameStatus },
          disable: { accept: true, cancel: true },
        };
      }
      return {
        ...orderItem,
        status: {
          ...orderItem?.status,
          statusName: userStatusFind?.length > 0 ? 'Accepted' : 'Wait',
        },
        disable: { accept: false, cancel: false },
      };
    });
    return {
      data: dataNew,
      count: total,
    };
  }

  async addNew(body, request) {
    if (body?.products) {
      const departID = request?.user?.department?.departID;
      if (!departID) {
        return null;
      }
      const userStatus = await this.statusService.findByUserID(
        request?.user.id,
        departID,
      ); //check user có phải người duyệt hay không?
      let statusID = '';

      if (userStatus) {
        //neu la nguoi duyet
        statusID = userStatus.statusID; //gan status la ng do
      } else {
        // neu khong la nguoi duyệt -> laays ra status của phòng ban = new
        const rs = await this.statusService.findNewByDepartmentID(departID);
        if (rs) {
          statusID = rs.statusID;
        } else {
          return null;
        }
      }

      const productArr = JSON.parse(body?.products);
      const total = getSubTotal(productArr);
      const department = new Department();
      department.departID = request?.user?.department?.departID;
      const data = {
        userID: request?.user?.id,
        department: department,
        total: `${total}`,
        reciever: body?.reciever,
        note: body?.note,
        statusID: statusID,
        created_by: request?.user?.username,
        code: ranDomUID(),
      };
      const newOrder = await this.orderRepo.insert(data);
      const newOrderID = newOrder?.identifiers[0]?.orderID;
      if (newOrderID) {
        const arrDetailUpdate = [];
        const arrProductNew = [];
        productArr.map((item) => {
          arrProductNew.push({
            productID: item?.productID,
            inventory: parseInt(item?.inventory) - parseInt(item?.quantity),
          });
          arrDetailUpdate.push({
            orderID: newOrderID,
            productID: item?.productID,
            price: `${item?.price}`,
            quantity: item?.quantity,
            unit: item?.unit,
          });
        });
        try {
          const dataInserted =
            await this.orderDetailRepo.insert(arrDetailUpdate);
          return { dataInserted, newOrder };
        } catch (error) {
          console.log('error', error);
        }
      }
    }
    return null;
  }

  async cancel(body, request) {
    const orderIDBody = body?.orderID;
    const user = request?.user;

    if (orderIDBody) {
      const order = await this.orderRepo.findOne({
        where: { orderID: orderIDBody },
      });

      if (order && order?.statusID) {
        order.cancel_by = user?.username;
        order.status = null;
        order.cancel_at = new Date();
        await this.orderRepo.save(order);
        return order;
        //null
      }
      //null
    }
    return null;
  }
  // truong hop: khong co acc quan ly
  async changeStatus(body, request) {
    const orderIDBody = body?.orderID;
    const status = body?.status;
    const departmentID = body?.departmentID;

    if (orderIDBody) {
      const order = await this.orderRepo.findOne({
        where: { orderID: orderIDBody },
        relations: ['status'],
      });
      if (order) {
        if (order?.status) {
          const newLevel = order?.status?.level + 1;
          const statusNew = await this.statusService.findByLevel(
            newLevel,
            order?.departmentID,
          );
          // trường hợp nếu là max - 1 thì -> chi tinh
          //
          if (statusNew) {
            order.status = statusNew?.status;
            const saved = await this.orderRepo.save(order);
            return saved;
          }
          return order;
        }
        //null
      }
      //null
    }
    return null;
  }
  async detail(body, request, res) {
    const orderID = body?.orderID;
    if (orderID) {
      const order = await this.orderRepo.findOne({
        where: { orderID: orderID },
        relations: [
          'orderDetail',
          'orderDetail.product',
          'status',
          'department',
        ],
      });
      if (order) {
        return res.status(HttpStatus.OK).send(order);
      }
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ message: 'Cannot found Order!' });
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot found OrderID!' });
  }
  async detailWithStatus(body, request, res) {
    const orderID = body?.orderID;
    if (orderID) {
      const order = await this.orderRepo.findOne({
        where: { orderID: orderID },
        relations: [
          'orderDetail',
          'orderDetail.product',
          'status',
          'department',
        ],
      });
      if (order) {
        const allStatus = await this.statusService.findByDepartID(
          order?.departmentID,
        );
        return res.status(HttpStatus.OK).send({ order, allStatus });
      }
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ message: 'Cannot found Order!' });
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Cannot found OrderID!' });
  }
  //   if (orderID) {
  //     //mr tinh len don -> mrSong -> mr
  //     if (status) {
  //       const userStatus = await this.statusService.findByUserID(
  //         request?.user.id,
  //       );
  //       let statusCont = status?.level + 1;
  //       if (
  //         userStatus &&
  //         request?.user?.isManager &&
  //         departmentID === request?.user?.departmentID
  //       ) {
  //         // truong hop la quan ly + nguoi duyet
  //         statusCont = userStatus?.level;
  //       }
  //       const dataDeparts = await this.departService.findByCode([
  //         'rd',
  //         'pp',
  //         'sale',
  //         'it',
  //         'hr',
  //       ]);
  //       let dataIdDeparts = [];
  //       if (dataDeparts?.length > 0) {
  //         dataIdDeparts = dataDeparts.map((item) => item?.departID);
  //       }
  //       if (dataIdDeparts.includes(departmentID) && statusCont === 2) {
  //         statusCont = statusCont + 1;
  //       }
  //       //nếu chuyền lên status,
  //       const statusNew =
  //         await this.statusService.findByLevelWithMax(statusCont);
  //       if (statusNew?.max?.level === statusCont) {
  //         const orderDetails = await this.orderDetailRepo.find({
  //           where: { orderID: orderID },
  //         });
  //         if (orderDetails?.length > 0) {
  //           const dataUpdate = orderDetails.map((item) => {
  //             return {
  //               productID: item.productID,
  //               quantity: item.quantity,
  //             };
  //           });

  //           await this.productService.updateInventory(dataUpdate);
  //         }
  //       }
  //       if (statusNew?.find) {
  //         const order = await this.orderRepo.update(orderID, {
  //           statusID: statusNew?.find.statusID,
  //           updated_by: request?.user?.username,
  //         });
  //         return order;
  //       }
  //     } else {
  //       //truwongf hopw cancel
  //       const statusCancel = await this.statusService.findByLevel(0);
  //       const order = await this.orderRepo.update(orderID, {
  //         statusID: statusCancel.statusID,
  //         updated_by: request?.user?.username,
  //         cancel_by: request?.user?.username,
  //         cancel_at: new Date(),
  //       });
  //       return order;
  //     }
  //   }
  //   return null;
  // }
}
