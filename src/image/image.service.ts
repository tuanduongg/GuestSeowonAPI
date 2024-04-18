import { HttpCode, HttpStatus, Injectable } from '@nestjs/common';
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
        console.log('imagePath', imagePath);
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
    const tableWidth = 1800;
    const headers = [
      { id: 'stt', title: 'STT', krText: '', width: tableWidth / 20 },
      { id: 'date', title: 'Ngày', krText: '(시간을)', width: tableWidth / 10 },
      { id: 'timeIn', title: 'Giờ đến', krText: '(Time In)', width: tableWidth / 10 },
      { id: 'timeOut', title: 'Giờ về', krText: '(Time Out)', width: tableWidth / 10 },
      { id: 'name', title: 'Tên khách', krText: '(방문자 이름)', width: tableWidth / 10 },
      { id: 'company', title: 'Công ty', krText: '(소속 회사)', width: tableWidth / 10 },
      { id: 'carNumber', title: 'Biển số xe', krText: '(이유)', width: tableWidth / 10 },
      { id: 'reason', title: 'Lý do', krText: '(이유)', width: tableWidth / 10 },
      { id: 'guardian', title: 'Người bảo lãnh', krText: '(담당자)', width: tableWidth / 10 },
      { id: 'department', title: 'Bộ phận', krText: '(방문 부서)', width: tableWidth / 10 }
    ];
    const rowHeight = 30;
    const headerHeight = 50;

    // Dữ liệu
    const data = [
      { stt: '1', date: '19/04/2024', timeIn: '08:00', timeOut: '08:00', name: 'SEOK HYUNWOOK', company: 'HYUNJUNG', carNumber: '98C-15586', reason: 'Meeting', guardian: 'MR.JUNG SEUNG JAE', department: 'QC' },
      { stt: '1', date: '19/04/2024', timeIn: '09:30', timeOut: '09:30', name: 'Alice', company: 'XYZ Inc', carNumber: '98C-15586', reason: 'Interview', guardian: 'Bob', department: 'HR' },
      { stt: '1', date: '19/04/2024', timeIn: '10:45', timeOut: '10:45', name: 'Bob', company: '123 Co', carNumber: '98C-15586', reason: 'Delivery', guardian: 'Eve', department: 'Logistics' },
      { stt: '1', date: '19/04/2024', timeIn: '13:15', timeOut: '13:15', name: 'Eve', company: '456 Ltd', carNumber: '98C-15586', reason: 'Consultation', guardian: 'Charlie', department: 'Marketing' },
      { stt: '1', date: '19/04/2024', timeIn: '15:00', timeOut: '15:00', name: 'Charlie', company: '789 Group', carNumber: '98C-15586', reason: 'Training', guardian: 'John', department: 'IT' }
    ];

    // Tạo canvas
    const canvas = Canvas.createCanvas(tableWidth, (data.length + 5) * rowHeight);
    const ctx = canvas.getContext('2d');
    const Padding = 10;
    const PaddingKRText = 20;
    

    // Vẽ bảng
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(0, 0, tableWidth, (data.length + 5) * rowHeight);

    // Vẽ tiêu đề cột và border
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px AppleGothic';
    ctx.textAlign = 'center';
    // ctx.fillText('STT', columnWidth / 4, (headerHeight + Padding) / 2 + PaddingKRText / 2); // Đặt STT ở một nửa của cột STT
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
      ctx.fillText(header.title, startDrawText, (headerHeight + Padding) / 2);
      if (header?.krText) {
        ctx.fillText(header?.krText, startDrawText, (headerHeight + Padding) / 2 + PaddingKRText);
      }
      ctx.strokeRect(startBorder, Padding, header.width, headerHeight); // Border for time column
    })

    // Vẽ các hàng dữ liệu
    ctx.font = '16px AppleGothic';
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
    // data.forEach((row, index) => {
    //   let y = (index + 1) * rowHeight + rowHeight;
    //   if (index === 0) {
    //     y = headerHeight + Padding + index + 1;
    //   }
    //   headers.map((header, i) => {
    //     const x = i * columnWidth;
    //     const value = row[`${header.id}`];
    //     ctx.fillText(value, x + columnWidth / 2, y);
    //     // ctx.strokeRect(x, (index + 1) * rowHeight, columnWidth, rowHeight); // Border for data cell
    //   })
    // });

    // Lấy buffer ảnh
    const buffer = canvas.toBuffer('image/png');
    res.status(HttpStatus.OK);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  }
}
