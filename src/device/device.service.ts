import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceLicenseService } from 'src/device_license/device_license.service';
import { Device } from 'src/entity/device.entity';
import { License } from 'src/entity/license.entity';
import { STATUS_DEVICE } from 'src/enum';
import { ImageDeviceService } from 'src/image_device/image_device.service';
import { Between, In, LessThan, Like, MoreThan, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { CategoryService } from 'src/category/category.service';
import { DeviceLicense } from 'src/entity/device_license.entity';
import { LicenseService } from 'src/License/license.service';
import * as cheerio from 'cheerio';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepo: Repository<Device>,
    private readonly imageDeviceService: ImageDeviceService,
    private readonly deviceLinceseService: DeviceLicenseService,
    private readonly lincenseServeice: LicenseService,
    private readonly categoryService: CategoryService,
  ) { }
  async all(body, request, res) {
    // const category = body?.category;
    // const status = body?.status;
    // const expiration = body?.expiration;
    // const search = body?.search ?? '';
    // const whereObj = {};
    // const whereArrCondition = [
    //   'NAME',
    //   'DEVICE_CODE',
    //   'USER_DEPARTMENT',
    //   'USER_FULLNAME',
    // ]; //where theo từng property
    // const whereArr = [];

    // switch (expiration) {
    //   case 'in_expiration':
    //     whereObj['EXPIRATION_DATE'] = MoreThan(new Date());
    //     break;
    //   case 'end_expiration':
    //     whereObj['EXPIRATION_DATE'] = LessThan(new Date());
    //     break;
    //   case 'month_expiration':
    //     const today = new Date();
    //     const lastDayOfMonth = new Date(
    //       today.getFullYear(),
    //       today.getMonth() + 1,
    //       0,
    //     );
    //     const firstDayOfMonth = new Date(
    //       today.getFullYear(),
    //       today.getMonth(),
    //       1,
    //     );
    //     whereObj['EXPIRATION_DATE'] = Between(firstDayOfMonth, lastDayOfMonth);
    //     break;

    //   default:
    //     delete whereObj['EXPIRATION_DATE'];
    //     break;
    // }

    // if (category && category !== 'all') {
    //   whereObj['category'] = { categoryID: category };
    // }
    // if (status && status !== 'all') {
    //   whereObj['STATUS'] = status;
    // }
    // for (let index = 0; index < whereArrCondition.length; index++) {
    //   const element = whereArrCondition[index];
    //   let newObjWhere = {
    //     ...whereObj,
    //   };
    //   newObjWhere[element] = Like(`%${search}%`);
    //   whereArr.push(newObjWhere);
    //   newObjWhere = {};
    // }

    const data = await this.deviceRepo.find({
      where: this.makeArrayWhere(body),
      select: {
        DEVICE_ID: true,
        NAME: true,
        PRICE: true,
        STATUS: true,
        BUY_DATE: true,
        EXPIRATION_DATE: true,
        USER_FULLNAME: true,
        USER_DEPARTMENT: true,
        categoryID: true,
        DEVICE_CODE: true,
        LOCATION: true,
        category: {
          categoryName: true,
        },
      },
      relations: ['category'],
      order: { CREATE_AT: 'DESC' },
    });
    return res?.status(HttpStatus.OK)?.send(data);
  }
  async detail(body, request, res) {
    if (body?.DEVICE_ID) {
      const data = await this.deviceRepo.findOne({
        where: { DEVICE_ID: body?.DEVICE_ID },
        relations: [
          'category',
          'images',
          'deviceLicense',
          'deviceLicense.lincense',
        ],
      });
      return res?.status(HttpStatus.OK)?.send(data);
    }
    return res
      ?.status(HttpStatus.BAD_REQUEST)
      ?.send({ message: 'DEVICE_ID is required!' });
  }

  async add(body, request, res, files) {
    const fileSave = files?.map((file) => {
      return {
        TITLE: file?.originalname,
        URL: file?.filename,
        IS_SHOW: true,
      };
    });
    if (body?.data) {
      const dataOBJ = JSON.parse(body?.data);

      const listLicense = dataOBJ?.listLicense ?? [];

      const NAME = dataOBJ?.NAME ?? '';
      const categoryID = dataOBJ?.categoryID ?? '';
      const MODEL = dataOBJ?.MODEL ?? '';
      const MANUFACTURER = dataOBJ?.MANUFACTURER ?? '';
      const SERIAL_NUMBER = dataOBJ?.SERIAL_NUMBER ?? '';
      const MAC_ADDRESS = dataOBJ?.MAC_ADDRESS ?? '';
      const IP_ADDRESS = dataOBJ?.IP_ADDRESS ?? '';
      const PRICE = dataOBJ?.PRICE?.replace(',', '') ?? '';
      const BUY_DATE = dataOBJ?.BUY_DATE ?? null;
      const EXPIRATION_DATE = dataOBJ?.EXPIRATION_DATE ?? null;
      const USER_FULLNAME = dataOBJ?.USER_FULLNAME ?? '';
      const USER_CODE = dataOBJ?.USER_CODE ?? '';
      const USER_DEPARTMENT = dataOBJ?.USER_DEPARTMENT ?? '';
      const INFO = dataOBJ?.INFO ?? '';
      const NOTE = dataOBJ?.NOTE ?? '';
      const LOCATION = dataOBJ?.LOCATION ?? '';
      const DEVICE_CODE = dataOBJ?.DEVICE_CODE ?? null;
      const STATUS = dataOBJ?.STATUS ?? 'FREE';

      const newDevice = new Device();
      newDevice.NAME = NAME;
      newDevice.categoryID = categoryID;
      newDevice.MODEL = MODEL;
      newDevice.MANUFACTURER = MANUFACTURER;
      newDevice.SERIAL_NUMBER = SERIAL_NUMBER;
      newDevice.MAC_ADDRESS = MAC_ADDRESS;
      newDevice.IP_ADDRESS = IP_ADDRESS;
      newDevice.PRICE = PRICE;
      if (BUY_DATE) {
        newDevice.BUY_DATE = BUY_DATE;
      }
      if (EXPIRATION_DATE) {
        newDevice.EXPIRATION_DATE = EXPIRATION_DATE;
      }
      newDevice.USER_FULLNAME = USER_FULLNAME;
      newDevice.USER_CODE = USER_CODE;
      newDevice.USER_DEPARTMENT = USER_DEPARTMENT;
      newDevice.INFO = INFO;
      newDevice.STATUS = STATUS;
      newDevice.NOTE = NOTE;
      newDevice.LOCATION = LOCATION;
      newDevice.DEVICE_CODE = DEVICE_CODE;

      try {
        const data = await this.deviceRepo.save(newDevice);
        if (data?.DEVICE_ID) {
          await this.imageDeviceService.add(
            fileSave.map((each) => {
              return { ...each, device: newDevice };
            }),
          );
          if (listLicense?.length > 0) {
            const listLincenseNew = listLicense.map((lincense) => {
              return {
                ...lincense,
                LICENSE_PRICE: lincense?.LICENSE_PRICE?.replaceAll(',', ''),
                LICENSE_END_DATE: lincense?.LICENSE_END_DATE,
                LICENSE_START_DATE: lincense?.LICENSE_START_DATE,
                device: newDevice,
                lincense: (new License().LICENSE_ID = lincense.LICENSE_ID),
              };
            });
            await this.deviceLinceseService.add(listLincenseNew);
          }
          return res?.status(HttpStatus.OK).send(newDevice);
        } else {
          return res
            ?.status(HttpStatus.BAD_REQUEST)
            .send({ message: 'An error occurred while saving device!' });
        }
      } catch (error) {
        console.log(error);

        // xóa hình ảnh
        await this.imageDeviceService.deleteOnFolder(fileSave);
        return res
          ?.status(HttpStatus.BAD_REQUEST)
          .send({ message: 'An error occurred while saving!' });
      }
    } else {
      await this.imageDeviceService.deleteOnFolder(fileSave);
      return res
        ?.status(HttpStatus.BAD_REQUEST)
        .send({ message: 'Data not empty!' });
    }
  }
  async addMultiple(body, request, res) {
    const data = body?.data;
    if (data && data?.length > 0) {
      console.log('data', body?.data);
      data?.map((item: any) => { });
      return res?.status(HttpStatus.OK).send({});
    }
  }
  formatDate(dateString) {
    let date;
    if (dateString.includes('/')) {
      let [day, month, year] = dateString.split('/').map(Number);
      if (`${month}`.length === 4) {
        year = month;
        month = day;
        day = 1;
      }

      date = new Date(year, month - 1, day);
      return date;
    } else {
      date = new Date(dateString);
      return date;
    }
    return null;
  }
  private makeArrayWhere(body) {
    const category = body?.category;
    const status = body?.status;
    const expiration = body?.expiration;
    const search = body?.search ?? '';
    const whereObj = {};
    const whereArrCondition = [
      'NAME',
      'DEVICE_CODE',
      'USER_DEPARTMENT',
      'USER_FULLNAME',
    ]; //where theo từng property
    const whereArr = [];

    switch (expiration) {
      case 'in_expiration':
        whereObj['EXPIRATION_DATE'] = MoreThan(new Date());
        break;
      case 'end_expiration':
        whereObj['EXPIRATION_DATE'] = LessThan(new Date());
        break;
      case 'month_expiration':
        const today = new Date();
        const lastDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        whereObj['EXPIRATION_DATE'] = Between(firstDayOfMonth, lastDayOfMonth);
        break;

      default:
        delete whereObj['EXPIRATION_DATE'];
        break;
    }

    if (category && category !== 'all') {
      whereObj['category'] = { categoryID: category };
    }
    if (status && status !== 'all') {
      whereObj['STATUS'] = status;
    }
    for (let index = 0; index < whereArrCondition.length; index++) {
      const element = whereArrCondition[index];
      let newObjWhere = {
        ...whereObj,
      };
      newObjWhere[element] = Like(`%${search}%`);
      whereArr.push(newObjWhere);
      newObjWhere = {};
    }
    return whereArr;
  }
  //   {
  //     "DEVICE_ID": "D3DAB11F-1A37-EF11-A1F7-08BFB89BCBB5",
  //     "DEVICE_CODE": " ",
  //     "NAME": "PC Spare Director",
  //     "PRICE": "",
  //     "STATUS": "USING",
  //     "BUY_DATE": "2019-11-30T17:00:00.000Z",
  //     "LOCATION": "Office",
  //     "EXPIRATION_DATE": null,
  //     "USER_FULLNAME": "Spare",
  //     "USER_DEPARTMENT": "Director",
  //     "categoryID": "6E1D153F-CB13-EF11-A1EB-08BFB89BCBB5",
  //     "category": {
  //         "categoryName": "PC"
  //     }
  // }
  extractInfo(htmlString: string): Record<string, string> {
    // Sử dụng cheerio để phân tích cú pháp HTML
    const $ = cheerio.load(htmlString);

    // Khởi tạo đối tượng để lưu thông tin
    const info: Record<string, string> = {};

    // Duyệt qua tất cả các phần tử li và trích xuất thông tin
    $('li').each((index, element) => {
      const text = $(element).text();
      const [key, value] = text.split(':');
      if (key && value) {
        info[key.trim()] = value.trim();
      }
    });

    return info;
  }

  async exportExcel(body, res, request) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Thêm tiêu đề cột
    worksheet.columns = [
      { header: 'STT', key: 'STT', width: 5 },
      { header: 'Loại', key: 'CATEGORY_NAME', width: 10 },
      { header: 'Code', key: 'DEVICE_CODE', width: 10 },
      { header: 'Mã nhân viên', key: 'USER_CODE', width: 15 },
      { header: 'Người sử dụng', key: 'USER_FULLNAME', width: 30 },
      { header: 'Bộ phận', key: 'USER_DEPARTMENT', width: 20 },
      { header: 'Vị trí', key: 'LOCATION', width: 20 },
      { header: 'IP', key: 'IP_ADDRESS', width: 15 },
      { header: 'MAC', key: 'MAC_ADDRESS', width: 17 },
      { header: 'Ngày mua', key: 'BUY_DATE', width: 15 },
      { header: 'Main', key: 'Main', width: 10 },
      { header: 'CPU', key: 'CPU', width: 10 },
      { header: 'RAM', key: 'RAM', width: 10 },
      { header: 'Monitor(1)', key: 'MONITOR_1', width: 15 },
      { header: 'Monitor(2)', key: 'MONITOR_2', width: 15 },
      { header: 'HDD', key: 'HDD', width: 10 },
      { header: 'Keyboard', key: 'KEYBOARD', width: 10 },
      { header: 'Mouse', key: 'MOUSE', width: 10 },
    ];
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    })
    const data = await this.deviceRepo.find({
      where: this.makeArrayWhere(body),
      relations: ['category','deviceLicense','deviceLicense.lincense'],
      order: { USER_DEPARTMENT: 'ASC' },
    });
    console.log('data',data[0]?.deviceLicense);
    
    const newData = data.map((device, index) => {
      const infoObj = this.extractInfo(device?.INFO);
      return { ...device, STT: index + 1,
        CATEGORY_NAME: device?.category?.categoryName,
         Main: infoObj?.Main,
         CPU: infoObj?.CPU,
         RAM: infoObj?.Ram,
         HDD: infoObj?.HDD,
         KEYBOARD: infoObj?.Keyboard,
         MOUSE: infoObj?.Mouse,
         MONITOR_1: infoObj['Monitor 1'],
         MONITOR_2: infoObj['Monitor 2'],
        }
    })
    // console.log('data', data);

    // Thiết lập kiểu in đậm cho hàng tiêu đề
    // Thêm dữ liệu
    worksheet.addRows(newData);

    worksheet.eachRow((row) => {
      row.eachCell({ includeEmpty: true },(cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Thiết lập response header để download file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'report.xlsx',
    );

    // Xuất file Excel
    await workbook.xlsx.write(res);
    res.end();
  }
  async readExcelFile(file, res, request) {

    if (!file || file?.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return res
        ?.status(HttpStatus.BAD_REQUEST)
        .send({ message: 'Check excel file!' });
    }
    const workbook = new ExcelJS.Workbook();
    // try {
    await workbook.xlsx.load(file?.buffer);
    // } catch (error) {
    // return res
    //   ?.status(HttpStatus.BAD_REQUEST)
    //   .send({ message: 'Check excel file!' });
    // }
    const worksheet = workbook.getWorksheet(1);
    const arrCategory = await this.categoryService.getAllDeviceType();
    const arrLincense = await this.lincenseServeice.getAll();

    const rows = [];
    const arrSave = [];
    const arrDeviceLincenseSave = [];
    for (let i = 1; i <= worksheet?.rowCount; i++) {
      const row = {};
      let temp = false;
      for (let j = 1; j <= worksheet?.columnCount; j++) {
        const numValues = worksheet.getRow(i).actualCellCount;
        if (numValues > 0) {
          const header = worksheet.getRow(1).values[j];
          const value = worksheet.getRow(i).values[j];
          temp = true;
          row[header] = value;
        }
      }
      if (temp) {
        rows[i] = row;
      }
    }

    let check = '';
    rows.map((row, index) => {
      const lengthRow = Object.keys(row).length;
      if (lengthRow === 35) {
        if (index > 1 && row?.NAME) {
          const newDevice = new Device();
          newDevice.NAME = row?.NAME;
          newDevice.MODEL = row?.MODEL ?? '';
          newDevice.MANUFACTURER = row?.MANUFACTURER ?? '';
          newDevice.SERIAL_NUMBER = row?.SERIAL_NUMBER ?? '';
          newDevice.MAC_ADDRESS = row?.MAC_ADDRESS ?? '';
          newDevice.IP_ADDRESS = row?.IP_ADDRESS ?? '';
          newDevice.PRICE = row?.PRICE ?? '';
          newDevice.USER_FULLNAME = row?.USER_FULLNAME ?? '';
          newDevice.USER_CODE = row?.USER_CODE ?? '';
          newDevice.USER_DEPARTMENT = row?.USER_DEPARTMENT ?? '';
          newDevice.INFO = row?.INFO ?? '';
          newDevice.STATUS = row?.STATUS ?? '';
          newDevice.NOTE = row?.NOTE ?? '';
          newDevice.LOCATION = row?.LOCATION ?? '';
          newDevice.DEVICE_CODE = row?.DEVICE_CODE ?? '';
          newDevice.CREATE_BY = request?.user?.username ?? '';
          newDevice.CREATE_AT = new Date();
          const arrLinceseExcel = [
            'Win10_Home',
            'Win10_OLP',
            'Office_Std_OLP_2013_2019_2021',
            'Autocad_LT_2020_2021_2023',
            'AutoCAD_2015_2014',
            'Power_Mill',
            'Nx_10',
            'Minitab_20',
          ];
          arrLinceseExcel.map((linceseEx) => {
            if (row[linceseEx]) {
              const deviceLincese = new DeviceLicense();
              deviceLincese.LICENSE_KEY = row[linceseEx];
              deviceLincese.device = newDevice;
              const lincenseFind = arrLincense.find(
                (lincense) =>
                  lincense?.LICENSE_NAME?.toLocaleUpperCase() ===
                  linceseEx?.replaceAll('_', ' ')?.toLocaleUpperCase(),
              );
              deviceLincese.lincense = lincenseFind;
              arrDeviceLincenseSave.push(deviceLincese);
            }
          });
          if (row?.BUY_DATE) {
            newDevice.BUY_DATE = this.formatDate(row?.BUY_DATE);
          }
          if (row?.EXPIRATION_DATE) {
            newDevice.EXPIRATION_DATE = this.formatDate(row?.EXPIRATION_DATE);
          }
          newDevice.category = arrCategory.find(
            (cate) => cate.categoryName === row?.CATEGORY,
          );
          const text = `<ul>${row?.Main ? `<li>Main:${row?.Main}</li>` : ''}${row?.CPU ? `<li>CPU:${row?.CPU}</li>` : ''}${row?.Ram ? `<li>Ram:${row?.Ram}</li>` : ''} ${row?.Monitor1 ? `<li>Monitor 1:${row?.Monitor1}` : ''} ${row?.Monitor2 ? `<li>Monitor 2:${row?.Monitor2}` : ''}${row?.HDD ? `<li>HDD:${row?.HDD}</li>` : ''}${row?.Keyboard ? `<li>Keyboard:${row?.Keyboard}</li>` : ''}${row?.Mouse ? `<li>Mouse:${row?.Mouse}</li>` : ''}</ul>`;
          newDevice.INFO = text;
          arrSave.push(newDevice);
        } else {
          if (index != 1) {
            check += `${index} `;
          }
        }
      }
    });
    const batchSize = 100;
    const totalRecords = arrSave.length;
    if (totalRecords > 99) {
      let currentIndex = 0;
      while (currentIndex < totalRecords) {
        const batch = arrSave.slice(currentIndex, currentIndex + batchSize);
        await this.deviceRepo.save(batch);
        currentIndex += batchSize;
      }
    } else {
      await this.deviceRepo.save(arrSave);
    }
    await this.deviceLinceseService.saveMultiple(arrDeviceLincenseSave);
    // return res
    //   ?.status(HttpStatus.OK)
    //   ?.send({ saved: saved, notSavedRow: check });
    return res
      ?.status(HttpStatus.OK)
      ?.send({ notSavedRow: check, saved: arrSave });
  }

  async edit(body, request, res, files) {
    const fileSave = files?.map((file) => {
      return {
        TITLE: file?.originalname,
        URL: file?.filename,
        IS_SHOW: true,
      };
    });
    if (body?.data) {
      const dataOBJ = JSON.parse(body?.data);
      const DEVICE_ID = dataOBJ?.DEVICE_ID ?? '';
      const newDevice = await this.deviceRepo.findOne({ where: { DEVICE_ID } });
      if (!newDevice) {
        return res
          ?.status(HttpStatus.BAD_REQUEST)
          .send({ message: 'Cannot found device!' });
      }

      const NAME = dataOBJ?.NAME ?? '';
      const categoryID = dataOBJ?.categoryID ?? '';
      const MODEL = dataOBJ?.MODEL ?? '';
      const MANUFACTURER = dataOBJ?.MANUFACTURER ?? '';
      const SERIAL_NUMBER = dataOBJ?.SERIAL_NUMBER ?? '';
      const MAC_ADDRESS = dataOBJ?.MAC_ADDRESS ?? '';
      const IP_ADDRESS = dataOBJ?.IP_ADDRESS ?? '';
      const PRICE = dataOBJ?.PRICE?.replace(',', '') ?? '';
      const BUY_DATE = dataOBJ?.BUY_DATE ?? null;
      const EXPIRATION_DATE = dataOBJ?.EXPIRATION_DATE ?? null;
      const USER_FULLNAME = dataOBJ?.USER_FULLNAME ?? '';
      const USER_CODE = dataOBJ?.USER_CODE ?? '';
      const USER_DEPARTMENT = dataOBJ?.USER_DEPARTMENT ?? '';
      const INFO = dataOBJ?.INFO ?? '';
      const NOTE = dataOBJ?.NOTE ?? '';
      const DEVICE_CODE = dataOBJ?.DEVICE_CODE ?? '';
      const LOCATION = dataOBJ?.LOCATION ?? '';
      const STATUS = dataOBJ?.STATUS ?? 'FREE';

      newDevice.DEVICE_ID = DEVICE_ID;
      newDevice.NAME = NAME;
      newDevice.categoryID = categoryID;
      newDevice.MODEL = MODEL;
      newDevice.MANUFACTURER = MANUFACTURER;
      newDevice.SERIAL_NUMBER = SERIAL_NUMBER;
      newDevice.MAC_ADDRESS = MAC_ADDRESS;
      newDevice.IP_ADDRESS = IP_ADDRESS;
      newDevice.DEVICE_CODE = DEVICE_CODE;
      newDevice.PRICE = `${PRICE}`?.replace(',', '');
      if (BUY_DATE) {
        newDevice.BUY_DATE = BUY_DATE;
      }
      if (EXPIRATION_DATE) {
        newDevice.EXPIRATION_DATE = EXPIRATION_DATE;
      }
      newDevice.USER_FULLNAME = USER_FULLNAME;
      newDevice.USER_CODE = USER_CODE;
      newDevice.USER_DEPARTMENT = USER_DEPARTMENT;
      newDevice.INFO = INFO;
      newDevice.NOTE = NOTE;
      newDevice.LOCATION = LOCATION;
      newDevice.STATUS = STATUS;

      const data = await this.deviceRepo.save(newDevice);
      try {
        await this.imageDeviceService.add(
          fileSave.map((each) => {
            return { ...each, device: newDevice };
          }),
        );
      } catch (error) {
        await this.imageDeviceService.deleteOnFolder(fileSave);
      }
      const listLicense = dataOBJ?.listLicense;

      if (listLicense?.length > 0) {
        const listLincenseNew = listLicense.map((lincense) => {
          return {
            ...lincense,
            LICENSE_PRICE: lincense?.LICENSE_PRICE?.replaceAll(',', ''),
            LICENSE_END_DATE: lincense?.LICENSE_END_DATE,
            LICENSE_START_DATE: lincense?.LICENSE_START_DATE,
            device: newDevice,
            lincense: (new License().LICENSE_ID = lincense.LICENSE_ID),
          };
        });

        await this.deviceLinceseService.removeAndSave(
          DEVICE_ID,
          listLincenseNew,
        );
      }
      return res?.status(HttpStatus.OK).send(data);
    } else {
      await this.imageDeviceService.deleteOnFolder(fileSave);
      return res
        ?.status(HttpStatus.BAD_REQUEST)
        .send({ message: 'Data not empty!' });
    }
  }

  async changeStatus(body, request, res) {
    const deviceID = body?.DEVICE_ID;
    const statusNew = body?.STATUS;
    const username = request?.user?.username;
    const device = await this.deviceRepo.findOne({
      where: { DEVICE_ID: deviceID },
    });
    if (device) {
      device.STATUS = statusNew;
      device.UPDATE_AT = new Date();
      device.UPDATE_BY = username;
      await this.deviceRepo.save(device);
      return res?.status(HttpStatus.OK).send(device);
    }
    return res
      ?.status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Change status fail!' });
  }

  async statistic(res) {
    // 1. Count the number of devices grouped by status
    const countsByStatusPromies = this.deviceRepo
      .createQueryBuilder('device')
      .select('device.STATUS', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('device.STATUS')
      .getRawMany();

    // 2. Count the total number of devices
    const totalCountPromies = this.deviceRepo
      .createQueryBuilder('device')
      .getCount();

    // 3. Count the number of devices with EXPIRATION_DATE in the current month
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-based month
    const currentYear = new Date().getFullYear();

    const expirationCountPromies = this.deviceRepo
      .createQueryBuilder('device')
      .where('YEAR(device.EXPIRATION_DATE) = :currentYear', { currentYear })
      .andWhere('MONTH(device.EXPIRATION_DATE) = :currentMonth', {
        currentMonth,
      })
      .getCount();

    Promise.all([
      countsByStatusPromies,
      totalCountPromies,
      expirationCountPromies,
    ])
      .then((values) => {
        const statuses = {};
        statuses[STATUS_DEVICE.FIXING] = 0;
        statuses[STATUS_DEVICE.FREE] = 0;
        statuses[STATUS_DEVICE.NONE] = 0;
        statuses[STATUS_DEVICE.USING] = 0;
        if (values[0]) {
          values[0]?.map((item) => {
            if (item?.status === STATUS_DEVICE.FIXING) {
              statuses[STATUS_DEVICE.FIXING] = item?.count;
            }
            if (item?.status === STATUS_DEVICE.FREE) {
              statuses[STATUS_DEVICE.FREE] = item?.count;
            }
            if (item?.status === STATUS_DEVICE.NONE) {
              statuses[STATUS_DEVICE.NONE] = item?.count;
            }

            if (item?.status === STATUS_DEVICE.USING) {
              statuses[STATUS_DEVICE.USING] = item?.count;
            }
          });
        }
        return res.status(HttpStatus.OK).send({
          statuses: statuses,
          total: values[1] ?? 0,
          expirationCount: values[2] ?? 0,
        });
      })
      .catch((err) => {
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      });
  }

  async delete(body, request, res) {
    if (body?.arrId) {
      try {
        const devices = await this.deviceRepo.find({
          where: { DEVICE_ID: In(body?.arrId) },
        });
        if (devices?.length > 0) {
          const promise1 = this.deviceLinceseService.removeByIdDevice(
            body?.arrId,
          );
          const promise2 = this.imageDeviceService.removeByArrDevice(
            body?.arrId,
          );
          await Promise.all([promise1, promise2]);
          await this.deviceRepo.remove(devices);
          return res
            .status(HttpStatus.OK)
            .send({ message: 'Delete successful' });
        }
        return res.status(HttpStatus.OK).send({ message: 'No device found!' });
      } catch (error) {
        console.log(error);

        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: 'Delete fail!' });
      }
      // await this.deviceRepo.remove(body)
      // const result = await this.imageDeviceService.removeByArrDevice(body.arrId);
      // console.log(result);
      // if (result) {
      // }
    }
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: 'Id is requried!' });
  }

  async deleteMultipleDevices(deviceIds: string[]): Promise<void> {
    // Start transaction
    await this.deviceRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // Find devices to ensure they exist and load their relationships
        const devices = await transactionalEntityManager.findByIds(
          Device,
          deviceIds,
        );

        // Delete each device and related images
        for (const device of devices) {
          await transactionalEntityManager.remove(Device, device);
        }
      },
    );
  }
}
