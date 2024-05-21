import {  HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/entity/image.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { join } from 'path';
import Canvas from 'canvas';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private imageRepo: Repository<Image>,
  ) { }

  async fake() {
    return this.imageRepo.insert([
      {
        productID: 'da025e2f-09aa-ee11-a1ca-04d9f5c9d2eb',
        url: '/image.jpg',
      },
      {
        productID: 'db025e2f-09aa-ee11-a1ca-04d9f5c9d2eb',
        url: '/image2.jpg',
      },
    ]);
  }
  async getAll() {
    return await this.imageRepo.find({});
  }
  async deleteByID(id) {
    try {
      const recordToDelete = await this.imageRepo.findOne({
        where: { imageID: id },
      });
      if (recordToDelete) {
        const imagePath =
          join(__dirname, '..', 'public').replace('\\dist', '') +
          '\\' +
          recordToDelete?.url;
        const remove = await this.imageRepo.remove(recordToDelete);
        await fs.unlinkSync(imagePath);
        console.log('remove', remove);
        return true;
      }
    } catch (error) {
      return null;
    }
  }
  async generate(res) {
    // Kích thước của bảng và cột
    const tableWidth = 2000;
    const headers = [
      { id: 'stt', title: 'STT', krText: '', width: tableWidth / 20 },
      { id: 'date', title: 'Ngày', krText: '(날짜)', width: tableWidth / 9 },
      { id: 'name', title: 'Tên khách', krText: '(방문자 이름)', width: tableWidth / 10 },
      { id: 'company', title: 'Công ty', krText: '(소속 회사)', width: tableWidth / 10 },
      { id: 'reason', title: 'Lý do', krText: '(방문내용 및사유)', width: tableWidth / 7 },
      { id: 'carNumber', title: 'Biển số xe', krText: '', width: tableWidth / 10 },
      { id: 'timeIn', title: 'Giờ đến', krText: '(입문예상시간)', width: tableWidth / 17 },
      { id: 'timeOut', title: 'Giờ về', krText: '(출문예상시간)', width: tableWidth / 17 },
      { id: 'guardian', title: 'Người bảo lãnh', krText: '(담당자)', width: tableWidth / 7 },
      { id: 'department', title: 'Bộ phận', krText: '(방문 부서)', width: tableWidth / 10 }
    ];
    const rowHeight = 30;
    const headerHeight = 50;

    // Dữ liệu
    const data = [
      { stt: '1', date: '19/04/2024 ~ 19/05/2024', timeIn: '08:00', timeOut: '08:00', name: 'SEOK HYUNWOOK', company: 'HYUNJUNG', carNumber: '98C-15586', reason: 'Meeting', guardian: 'MR.JUNG SEUNG JAE', department: 'QC' },
    ];

    // Tạo canvas
    const canvas = Canvas.createCanvas(tableWidth, (data.length + 5) * rowHeight);
    const ctx = canvas.getContext('2d');
    const Padding = 50;
    const PaddingNameTable = 10;
    const PaddingKRText = 20;

    // Vẽ bảng
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(0, 0, tableWidth, (data.length + 5) * rowHeight);


    // Vẽ tiêu đề cột và border
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px arial';
    ctx.textAlign = 'center';
    ctx.fillText('QUẢN LÝ ĐĂNG KÝ GẶP KHÁCH HẰNG NGÀY', tableWidth / 2, PaddingNameTable * 2 + 5);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Sans';
    ctx.textAlign = 'center';
    // ctx.strokeRect(Padding, Padding, columnWidth / 2, headerHeight); // Border for STT column
    let startBorder = 0;
    let startDrawText = 0;
    headers.map((header, index) => {
      if (index === 0) {
        startDrawText = (Padding + header.width) / 2;
        startBorder = Padding;
        // startDrawText = Padding + header.width * index + headers[index - 1].width;
      } else {
        startBorder += headers[index - 1].width;
        startDrawText = (startBorder + header.width + startBorder) / 2;
      }
      if (header?.krText) {
        ctx.fillText(header?.krText, startDrawText, (headerHeight + Padding) / 2 + headerHeight / 2 + PaddingKRText);
      } else {
        if (index === 0) {

          startDrawText += 25;
        }
      }
      ctx.fillText(header.title, startDrawText, (headerHeight + Padding) / 2 + headerHeight / 2);
      ctx.strokeRect(startBorder, Padding, header.width, headerHeight); // Border for time column
    })

    // Vẽ các hàng dữ liệu
    ctx.font = '16px Sans';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';

    // Vẽ từng hàng dữ liệu
    data.forEach((rowData, rowIndex) => {

      const startY = rowIndex * rowHeight + headerHeight + Padding; // Tính toán vị trí bắt đầu của hàng dữ liệu
      // Vẽ từng ô trong hàng dữ liệu
      headers.forEach((header, colIndex) => {
        const startX = colIndex === 0 ? Padding : headers.slice(0, colIndex).reduce((acc, cur) => acc + cur.width, Padding); // Tính toán vị trí bắt đầu của ô
        const cellValue = rowData[header.id]; // Lấy giá trị của ô từ dữ liệu hàng hiện tại
        ctx.fillText(cellValue, startX + header.width / 2, startY + 5 + rowHeight / 2); // Vẽ giá trị của ô ở giữa ô
        ctx.strokeRect(startX, startY, header.width, rowHeight); // Vẽ border cho ô
      });
    });

    // Lấy buffer ảnh
    const buffer = canvas.toBuffer('image/png');
    res.status(HttpStatus.OK);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  }
}
