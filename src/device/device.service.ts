import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'src/entity/device.entity';
import { ImageDeviceService } from 'src/image_device/image_device.service';
import { Repository } from 'typeorm';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepo: Repository<Device>,
    private readonly imageDeviceService: ImageDeviceService,
  ) {}
  async all(body, request, res) {
    const data = await this.deviceRepo.find({
      relations: ['category'],
    });
    return res?.status(HttpStatus.OK)?.send(data);
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
      const NAME = dataOBJ?.NAME ?? '';
      const categoryID = dataOBJ?.categoryID ?? '';
      const MODEL = dataOBJ?.MODEL ?? '';
      const MANUFACTURER = dataOBJ?.MANUFACTURER ?? '';
      const SERIAL_NUMBER = dataOBJ?.SERIAL_NUMBER ?? '';
      const MAC_ADDRESS = dataOBJ?.MAC_ADDRESS ?? '';
      const IP_ADDRESS = dataOBJ?.IP_ADDRESS ?? '';
      const PRICE = dataOBJ?.PRICE ?? '';
      const BUY_DATE = dataOBJ?.BUY_DATE ?? null;
      const EXPIRATION_DATE = dataOBJ?.EXPIRATION_DATE ?? null;
      const USER_FULLNAME = dataOBJ?.USER_FULLNAME ?? '';
      const USER_CODE = dataOBJ?.USER_CODE ?? '';
      const USER_DEPARTMENT = dataOBJ?.USER_DEPARTMENT ?? '';
      const INFO = dataOBJ?.INFO ?? '';
      const NOTE = dataOBJ?.NOTE ?? '';

      const newDevice = new Device();
      newDevice.NAME = NAME;
      newDevice.categoryID = categoryID;
      newDevice.MODEL = MODEL;
      newDevice.MANUFACTURER = MANUFACTURER;
      newDevice.SERIAL_NUMBER = SERIAL_NUMBER;
      newDevice.MAC_ADDRESS = MAC_ADDRESS;
      newDevice.IP_ADDRESS = IP_ADDRESS;
      newDevice.PRICE = PRICE;
      newDevice.BUY_DATE = BUY_DATE;
      newDevice.EXPIRATION_DATE = EXPIRATION_DATE;
      newDevice.USER_FULLNAME = USER_FULLNAME;
      newDevice.USER_CODE = USER_CODE;
      newDevice.USER_DEPARTMENT = USER_DEPARTMENT;
      newDevice.INFO = INFO;
      newDevice.STATUS = 'FREE';
      newDevice.NOTE = NOTE;

      try {
        const data = await this.deviceRepo.save(newDevice);
        if (data?.DEVICE_ID) {
          await this.imageDeviceService.add(
            fileSave.map((each) => {
              return { ...each, device: newDevice };
            }),
          );
          return res?.status(HttpStatus.OK).send(newDevice);
        } else {
          return res
            ?.status(HttpStatus.BAD_REQUEST)
            .send({ message: 'An error occurred while saving device!' });
        }
      } catch (error) {
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
}
