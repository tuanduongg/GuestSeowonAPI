import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { License } from 'src/entity/license.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(License)
    private repo: Repository<License>,
  ) { }

  async getAll() {
    return await this.repo.find({});
  }
  async fake() {
    return await this.repo.save([
      { LICENSE_ID: '2BA5F2C5-1A2E-EF11-A1E5-04D9F5C9D2EB', LICENSE_NAME: 'WIN7 OLP' },
      { LICENSE_ID: '33E3EB38-1B2E-EF11-A1E5-04D9F5C9D2EB', LICENSE_NAME: 'WIN7 OEM' },
      { LICENSE_ID: 'C301390A-1C2E-EF11-A1E5-04D9F5C9D2EB', LICENSE_NAME: 'Win10 Home' },
      { LICENSE_ID: '758F3441-1E2E-EF11-A1E5-04D9F5C9D2EB', LICENSE_NAME: 'Office Std OLP 2013 2019 2021' },
      { LICENSE_ID: '2908C456-CE31-EF11-A1E6-04D9F5C9D2EB', LICENSE_NAME: 'Win10 OLP' },
      { LICENSE_ID: '9FA4D26B-CE31-EF11-A1E6-04D9F5C9D2EB', LICENSE_NAME: 'Autocad LT 2020 2021 2023' },
      { LICENSE_ID: 'FEAD9E79-CE31-EF11-A1E6-04D9F5C9D2EB', LICENSE_NAME: 'Minitab 20' },
      { LICENSE_ID: '4E35FD85-CE31-EF11-A1E6-04D9F5C9D2EB', LICENSE_NAME: 'Adobe AI' },
      { LICENSE_ID: 'C1B73892-CE31-EF11-A1E6-04D9F5C9D2EB', LICENSE_NAME: 'AutoCAD 2015 2014' },
      { LICENSE_ID: 'E34C5C9B-CE31-EF11-A1E6-04D9F5C9D2EB', LICENSE_NAME: 'Nx 10' },
      { LICENSE_ID: 'E8DE45A7-CE31-EF11-A1E6-04D9F5C9D2EB', LICENSE_NAME: 'Power Mill' },
    ]);
  }
}
