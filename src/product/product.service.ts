import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/entity/image.entity';
import { Product } from 'src/entity/product.entity';
import { In, LessThanOrEqual, Like, Repository, getConnection } from 'typeorm';
import ExcelJS from 'exceljs';
import fs from 'fs';
import { multerConfigLocation } from 'src/config/multer.config';
import { generateFileName } from 'src/helper';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Image)
    private readonly imageRepo: Repository<Image>,
  ) { }

  async changePublic(body) {
    const productID = body.productID;
    const product = await this.productRepo.findOne({ where: { productID } });
    if (product) {
      product.isShow = !product.isShow;
      return await this.productRepo.save(product);
    }
    return null;
  }

  async addProduct(product, request, files) {
    const user = request?.user;
    const productNew = await this.productRepo.insert({
      productName: product?.name,
      price: `${product?.price}`,
      description: product?.description,
      inventory: +product?.inventory,
      categoryID: product?.category,
      unit: product?.unit,
      isShow: true,
      created_by: user?.username,
    });
    if (productNew) {
      const productID = productNew?.raw[0]?.productID;
      let images = {};
      if (files && files?.length > 0) {
        const arrFiles = [];
        files.map((item) => {
          arrFiles.push({
            productID: productID,
            url: `${item?.filename}`,
            title: `${item?.originalname}`,
          });
        });
        images = await this.imageRepo.insert(arrFiles);
      }
      return { productNew, images };
      // return await this.productRepo.insert([productNew]);
    }
    return null;
  }

  async editProduct(product, request, files) {
    const user = request?.user;
    const productID = product?.productID;
    if (productID) {
      const updates = {
        productName: product?.name,
        price: `${product?.price}`,
        description: product?.description,
        inventory: product?.inventory,
        categoryID: product?.category,
        unit: product?.unit,
        isShow: true,
        updated_by: user?.username,
        updated_at: new Date(),
      };
      const updateResult = await this.productRepo.update(productID, updates);
      if (updateResult.affected === 1) {
        let images = {};
        if (files && files?.length > 0) {
          const arrFiles = [];
          files.map((item) => {
            arrFiles.push({
              productID: productID,
              url: `${item?.filename}`,
              title: `${item?.originalname}`,
            });
          });
          images = await this.imageRepo.insert(arrFiles);
        }
        return { updateResult, images };
      }
    }
    return null;
  }

  /**
   *
   * @param body array id guest kiểu string
   * @param request lấy thông tin user delete
   * @param res
   * @returns
   */
  async deleteProduct(body, request) {
    const productIDs = body.productIDs;
    const updated = await this.productRepo.update(
      {
        productID: In(productIDs),
      },
      { deleted_by: request?.user?.username, delete_at: new Date() },
    );
    return updated;
  }

  async getAllIsShow(query, isShowProp?) {
    const inventoryNegative = query?.inventoryNegative || false;
    const take = +query.rowsPerPage || 10;
    const page = +query.page || 0;
    const skip = page * take;
    const search = query.search || '';
    const categoryID = query.categoryID || '';
    const isShow = isShowProp ? isShowProp : false;

    const objWhere = isShowProp
      ? {
        isShow,
        productName: Like('%' + search + '%'),
        categoryID: categoryID,
        inventory: LessThanOrEqual(0)
      }
      : { productName: Like('%' + search + '%'),inventory: LessThanOrEqual(0) };

    if (categoryID) {
      objWhere.categoryID = categoryID;
    } else {
      delete objWhere.categoryID;
    }
    if (!inventoryNegative) {
      delete objWhere.inventory;
    }

    const [result, total] = await this.productRepo.findAndCount({
      where: { ...objWhere, delete_at: null },
      relations: ['images', 'category'],
      order: { created_at: 'DESC' },
      take: take,
      skip: skip,
    });

    return {
      data: result,
      count: total,
    };
  }
  async changeInventory(products) {
    if (products) {
      const data = await this.productRepo.save(products);
      return data;
    }
    return null;
  }

  private deleteFileOnErr(arrImageUpload) {
    // xóa hết ảnh đã lưu nếu có
    if (arrImageUpload?.length > 0) {
      arrImageUpload.map((img) => {
        const path = `${multerConfigLocation.dest}/${img?.url}`;
        if (fs.existsSync(path)) {
          fs.unlink(path, (err) => {
            if (err) {
              console.log(err);
            }
            console.log('deleted ' + img?.url);
          });
        }
      });
    }
  }

  async uploadExcel(body, files, request, res) {
    if (files) {
      // Parse the Excel file
      try {
        const workbook = new ExcelJS.Workbook();
        workbook.xlsx.load(files.buffer).then(async () => {
          const worksheet = workbook.getWorksheet('Sheet1');
          if (!worksheet) {
            return res?.status(HttpStatus.BAD_REQUEST).send({
              message: `Sheet upload must be name 'Sheet1'`,
            });
          }
          console.log('vao day');

          const arrImageUpload = [];
          if (worksheet?.getImages()?.length > 0) {
            for (const image of worksheet?.getImages()) {
              const img = workbook.model.media.find((m, index) => {
                return index === parseInt(image.imageId);
              });
              const url = `${image.range.tl.nativeRow + 1}.${image.range.tl.nativeCol}_${generateFileName(img.name)}.${img.extension}`;
              try {
                fs.writeFileSync(
                  `${multerConfigLocation.dest}/${url}`,
                  img.buffer as NodeJS.ArrayBufferView,
                );
                arrImageUpload.push({
                  url: url,
                  title: img.name,
                  isShow: true,
                });
              } catch (error) {
                console.log(error);
              }
            }
          }
          // console.log('count', worksheet.rowCount)
          const rowData = [];
          const arrImages = [];
          let check = '';

          for (
            let rowNumber = 1;
            rowNumber <= worksheet.rowCount;
            rowNumber++
          ) {
            const row = worksheet.getRow(rowNumber);
            const values = row.values;

            if (rowNumber >= 6) {
              if (values?.length === 9) {
                const nameProduct = row.getCell('B').value.toString(); //4
                const unit = row.getCell('C').value.toString(); //3
                const price = parseFloat(row.getCell('D').value.toString()); //5
                const inventory = parseInt(row.getCell('E').value.toString()); //8
                // const image = row.getCell('F').value; //6
                const desciption = row.getCell('G').value.toString(); //7
                const category = row.getCell('H').value.toString(); //7
                if (isNaN(price)) {
                  this.deleteFileOnErr(arrImageUpload);
                  check = `Sai định dạng tại cột D,Hàng ${rowNumber}`;
                  break;
                }
                if (isNaN(inventory)) {
                  this.deleteFileOnErr(arrImageUpload);
                  check = `Sai định dạng tại cột E,Hàng ${rowNumber}`;
                  break;
                }
                const imagesFind = this.getImageFromArr(
                  arrImageUpload,
                  rowNumber,
                );

                const uuid = uuidv4();
                const product = new Product();
                product.productID = uuid;
                product.productName = nameProduct;
                product.price = `${price}`;
                product.description = desciption;
                product.inventory = +inventory;
                product.unit = unit;
                product.isShow = true;
                product.categoryID = category;
                product.created_by = request?.user?.username;

                if (imagesFind) {
                  // const imageNew = new Image();
                  arrImages.push({
                    isShow: true,
                    url: imagesFind?.url,
                    title: imagesFind?.title,
                    productID: uuid,
                  });
                }
                rowData.push(product);
              }
            }

            // sai format
          }
          if (check !== '') {
            this.deleteFileOnErr(arrImageUpload);
            return res.status(HttpStatus.BAD_REQUEST).send({ message: check });
          }
          if (rowData.length > 0) {
            const saved = await this.productRepo.save(rowData);
            await this.imageRepo.save(arrImages);
            // if (saved) {

            return res.status(HttpStatus.OK).send(saved);
            // }
          }
          // xóa hết ảnh đã lưu nếu có
          this.deleteFileOnErr(arrImageUpload);
          console.log('case 1');
          return res
            .status(HttpStatus.BAD_REQUEST)
            .send({ message: 'Upload excel fail!' });
        });
      } catch (error) {
        console.log('errorr', error);
      }
    } else {
      return res
        ?.status(HttpStatus.BAD_REQUEST)
        .send({ message: 'File not found!' });
    }
  }

  private getImageFromArr(arrImageUpload, rowNumber) {
    const res = arrImageUpload.find((img) => {
      if (parseInt(img?.url.split('.')[0]) === rowNumber) {
        return true;
      }
      return false;
    });
    if (res) {
      const image = new Image();
      image.title = res?.title;
      image.url = res?.url;
      image.isShow = res?.isShow;
      return image;
    }
    return;
  }
  // const productRepository = getRepository(Product);
  // {
  //   'adfadsf':1,
  //   'adfadsf2':1,
  //   'adfadsf3':1,
  // }
  async updateInventory(productIDs) {
    // [
    //   { productID: '1', quantity: 2 },
    //   { productID: '2', quantity: 6 },
    //   { productID: '3', quantity: 8 },
    // ];
    const data = await Promise.all(
      productIDs.map(async ({ productID, quantity }) => {
        await this.productRepo
          .createQueryBuilder()
          .update(Product)
          .set({ inventory: () => `"inventory" - ${quantity}` })
          .where('productID = :productID', { productID })
          .execute();
      }),
    );
    return data;
  }

  async updateMultipleProductQuantities(productUpdates: { productID: string, quantity: number }[]): Promise<void> {
    const queryRunner = getConnection().createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const update of productUpdates) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(Product)
          .set({ inventory: () => `inventory - ${update.quantity}` })
          .where("productID = :productID", { productID: update.productID })
          .execute();
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
