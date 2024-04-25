import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentService } from 'src/department/deparment.service';
import { Department } from 'src/entity/department.entity';
import { Order } from 'src/entity/order.entity';
import { OrderDetail } from 'src/entity/order_detail.entity';
import { TABS_ORDER, getSubTotal, ranDomUID } from 'src/helper';
import { ProductService } from 'src/product/product.service';
import { StatusService } from 'src/status/status.service';
import {
  Between,
  In,
  IsNull,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

@Injectable()
export class OrderService {
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
    const take = +body.rowsPerPage || 10;
    const page = +body.page || 0;
    const skip = page * take;
    const search = body.search || '';
    const fromDate = body.fromDate ? new Date(body.fromDate) : new Date();
    const toDate = body.toDate ? new Date(body.toDate) : new Date();

    const type = body?.type;
    // neu la tai khoan duyet order thi sao?
    //+ lay ra các bản ghi có status > level có trong phòng ban mk được duyêt
    //+
    //neu khong la tai khoan duyet order thi sao?
    //+
    // vi du: mr jung: New: level 1,accept:level: 2,ca
    //

    /**
     *tài khoản bt:
     *tất cả: những đơn của mk
     *đơn mới: status === new, đơn của mình đang chờ duyệt
     *đã duyệt: những đơn status = done
     * đã hủy: những đơn có cancel at
     *
     * tai khoan người duyệt:
     * tất cả:những đơn của mình, đơn mk cần phải duyệt(mới),đơn mình đã duyêt, đơn mình đã hủy
     * đơn mới: những đơn level = level của mình - 1, phòng mk được duyệt
     * đã duyệt: những đơn level >= level của mk,phòng mình được duyệt
     * đã hủy:những đơn hủy bởi mình,những đơn của mk bị hủy
     *
     *
     * tài khoản chi tinh:
     * tất cả:những đơn của mình, đơn mk cần phải duyệt(mới),đơn mình đã duyêt, đơn mình đã hủy
     * đơn mới:những đơn của mình, những đơn level max
     * đã duyệt: những đơn của mình, những đơn level done
     * đã hủy: những đơn của mk hủy
     *
     */

    const userStatusFind = await this.statusService.getByUserID(userReq?.id);

    const selectOBJ = {
      orderID: true,
      code: true,
      departmentID: true,
      total: true,
      reciever: true,
      created_at: true,
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
        price: true,
        quantity: true,
        unit: true,
        product: {
          productID: true,
          productName: true,
        },
      },
    };
    let whereArr;
    if (userStatusFind?.length > 0) {
      const arrAll = [];
      const arrAccept = [];
      const arrNew = [];
      userStatusFind.map((item) => {
        arrAll.push({
          departmentID: item.departmentID,
          status: { level: MoreThanOrEqual(item.level - 1) },
        });
        arrAccept.push({
          departmentID: item.departmentID,
          status: { level: MoreThanOrEqual(item.level) },
        });
        arrNew.push({
          departmentID: item.departmentID,
          status: { level: item.level - 1 },
        });
      });
      //nguoi duyet
      switch (type) {
        case TABS_ORDER.ALL_TAB: //get all record
          whereArr = [
            { created_by: userReq?.username },
            { status: { level: -1 } },
            ...arrAll,
          ];
          break;
        case TABS_ORDER.ACCEPT_TAB:
          whereArr = arrAccept;
          break;
        case TABS_ORDER.NEW_TAB: // get all order status = new,level = 1
          whereArr = arrNew;
          break;
        case TABS_ORDER.CANCEL_TAB:
          whereArr = [{ cancel_by: userReq?.username }];
          break;

        default:
          break;
      }
    } else {
      // nguoi binh thuong
      switch (type) {
        case TABS_ORDER.ALL_TAB: //get all my record
          whereArr = { created_by: userReq?.username };
          break;
        case TABS_ORDER.ACCEPT_TAB:
          //nhưng order hoàn thành -> level = -1
          whereArr = {
            created_by: userReq?.username,
            status: { level: -1 },
          };
          break;
        case TABS_ORDER.NEW_TAB: // get all order status = new,level = 0
          whereArr = {
            created_by: userReq?.username,
            status: { level: 0 },
            cancel_at: IsNull(), // chưa bị hủy
          };
          break;
        case TABS_ORDER.CANCEL_TAB:
          whereArr = {
            created_by: userReq?.username,
            cancel_at: Not(IsNull()),
          };
          break;

        default:
          break;
      }
    }

    const data = await this.orderRepo.find({
      select: selectOBJ,
      where: whereArr,
      relations: ['status', 'orderDetail', 'department', 'orderDetail.product'],
      order: { created_at: 'DESC' },
    });
    const dataNew = data.map((orderItem) => {
      if (orderItem?.cancel_at) {
        // đơn đã hủy
        return { ...orderItem, disable: true };
      }
      const levelFound = this.getLevelByIdDepartment(
        userStatusFind,
        orderItem?.departmentID,
      );

      //những đơn mà có level status >= status của bản thân
      return {
        ...orderItem,
        disable: orderItem?.status?.level >= levelFound ? true : false,
      };
    });
    return dataNew;
    // if (userStatusFind?.length > 0) {
    //   const arrWhere = userStatusFind.map((item) => {
    //     return {
    //       departmentID: item.departmentID,
    //       status: { level: MoreThanOrEqual(item.level - 1) }, //lấy những đơn lớn hơn (level - 1)
    //     };
    //   });
    //   return await this.orderRepo.find({
    //     where: arrWhere,
    //     relations: [
    //       'status',
    //       'orderDetail',
    //       'department',
    //       'orderDetail.product',
    //     ],
    //     order: { created_at: 'DESC' },
    //   });
    // } else {
    //   return await this.orderRepo.find({
    //     where: { created_by: userReq?.username },
    //     relations: [
    //       'status',
    //       'orderDetail',
    //       'department',
    //       'orderDetail.product',
    //     ],
    //     order: { created_at: 'DESC' },
    //   });
    // }

    // return await this.orderRepo.find({
    //   relations: ['status', 'orderDetail', 'department', 'orderDetail.product'],
    //   order: { created_at: 'DESC' },
    // });

    // const arrWhere = [];

    // const cancelByWhere = {
    //   code: Like('%' + search + '%'),
    //   created_at: Between(fromDate, toDate),
    //   cancel_by: userReq?.username,
    //   // status: { value: status },
    // };

    // const userStatus = await this.statusService.findByUserID(userReq.id);

    // const objMyOrder = {
    //   code: Like('%' + search + '%'),
    //   created_at: Between(fromDate, toDate),
    //   userID: userReq.id,
    //   // status: { value: status },
    // };
    // arrWhere.push(objMyOrder);
    // if (userReq?.isManager) {
    //   const objIsManagerOrder = {
    //     code: Like('%' + search + '%'),
    //     created_at: Between(fromDate, toDate),
    //     departmentID: userReq?.departmentID,
    //     // status: { value: status },
    //   };
    //   arrWhere.push(objIsManagerOrder);
    //   arrWhere.push(cancelByWhere);
    // }
    // if (userStatus) {
    //   const objApproved = {
    //     code: Like('%' + search + '%'),
    //     created_at: Between(fromDate, toDate),
    //     status: { level: MoreThanOrEqual(userStatus.level - 1) },
    //     departmentID: Not(In([])),
    //   };
    //   if (userStatus?.level === 3) {
    //     const dataDeparts = await this.departService.findByCode([
    //       'rd',
    //       'pp',
    //       'sale',
    //       'it',
    //       'hr',
    //     ]);
    //     let dataIdDeparts = [];
    //     if (dataDeparts?.length > 0) {
    //       dataIdDeparts = dataDeparts.map((item) => item?.departID);
    //       objApproved.departmentID = Not(In(dataIdDeparts));
    //     }
    //   }
    //   arrWhere.push(objApproved);
    //   arrWhere.push(cancelByWhere);
    // }

    // const [result, total] = await this.orderRepo.findAndCount({
    //   select: {
    //     orderID: true,
    //     code: true,
    //     userID: true,
    //     departmentID: true,
    //     total: true,
    //     reciever: true,
    //     note: true,
    //     created_at: true,
    //     created_by: true,
    //     cancel_at: true,
    //     cancel_by: true,
    //     status: {
    //       statusID: true,
    //       statusName: true,
    //       userID: true,
    //       level: true,
    //     },
    //     orderDetail: {
    //       orderDetailID: true,
    //       price: true,
    //       quantity: true,
    //       unit: true,
    //       product: {
    //         productID: true,
    //         productName: true,
    //         description: true,
    //         images: true,
    //       },
    //     },
    //   },
    //   where: arrWhere,
    //   relations: [
    //     'status',
    //     'orderDetail',
    //     'orderDetail.product',
    //     'orderDetail.product.images',
    //   ],
    //   order: { created_at: 'DESC' },
    //   take: take,
    //   skip: skip,
    // });

    // return {
    //   data: result,
    //   count: total,
    //   userStatus,
    // };
  }

  async addNew(body, request) {
    if (body?.products) {
      const userStatus = await this.statusService.findByUserID(
        request?.user.id,
      ); //check user có phải người duyệt hay không?
      let statusID = '';
      if (userStatus) {
        //neu la nguoi duyet
        statusID = userStatus.statusID; //gan status la ng do
      } else {
        // neu khong la nguoi duyệt -> laays ra status của phòng ban = new
        const departmentUser = request?.user?.department?.departID;
        const rs =
          await this.statusService.findNewByDepartmentID(departmentUser);
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
  // 1270a16b-08aa-ee11-a1ca-04d9f5c9d2eb	Assy	assy
  // 1370a16b-08aa-ee11-a1ca-04d9f5c9d2eb	인사/회계/전산(Per/Acc/IT)	it
  // 1470a16b-08aa-ee11-a1ca-04d9f5c9d2eb	QC	qc
  // 1570a16b-08aa-ee11-a1ca-04d9f5c9d2eb	Rubber	rb
  // 1670a16b-08aa-ee11-a1ca-04d9f5c9d2eb	Injection	inj
  // a6e750de-f5b0-ee11-a1ca-04d9f5c9d2eb	Mold	mold
  // 8b15aae4-e0b8-ee11-a1ca-04d9f5c9d2eb	Spray	spray
  // bbb10430-f8b8-ee11-a1ca-04d9f5c9d2eb	HR	hr
  // b129f30c-ffbb-ee11-a1cb-b5b416639ec5	R&D	rd
  // b229f30c-ffbb-ee11-a1cb-b5b416639ec5	PP	pp
  // 890a051a-ffbb-ee11-a1cb-b5b416639ec5	Sale	sale

  async cancel(body, request) {
    const orderIDBody = body?.orderID;
    const user = request?.user;

    if (orderIDBody) {
      const order = await this.orderRepo.findOne({
        where: { orderID: orderIDBody },
      });
      if (order) {
        order.status = null;
        order.cancel_at = new Date();
        order.cancel_by = user?.username;
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
        const newLevel = order?.status?.level + 1;
        const statusNew = await this.statusService.findByLevel(
          newLevel,
          order?.departmentID,
        );
        console.log('statusNew', statusNew);
        // trường hợp nếu là max - 1 thì -> chi tinh
        //
        if (statusNew) {
          order.status = statusNew?.status;
          const saved = await this.orderRepo.save(order);
          return saved;
        }
        return order;
        //null
      }
      //null
    }
    return null;
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
