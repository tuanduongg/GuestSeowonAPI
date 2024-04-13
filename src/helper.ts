import dayjs from 'dayjs';

export const formatHourMinus = (date: any) => {
  if (date) {
    return dayjs(date).format('HH:mm');
  }
  return '';
};
export const concatGuestInfo = (arr = []) => {
  if (arr) {
    let result = '';
    arr.map((item, index) => {
      if (index === arr.length - 1) {
        result += item?.FULL_NAME;
      } else {
        result += item?.FULL_NAME + ', ';
      }
    });
    return result;
  }
  return '';
};
export const concatDateString = (arr = []) => {
  let text = '';
  if (arr && arr?.length > 0) {
    arr.map((item, index) => {
      if (index === arr?.length - 1) {
        text += item?.DATE;
      } else {
        text += item?.DATE + ', ';
      }
    });
  }
  return text;
};
export const getCurrentDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  const yyyy = today.getFullYear();

  return dd + '/' + mm + '/' + yyyy;
};

export const templateInBox = (savedGuest) => {
  const ID = `\n#: ${savedGuest.GUEST_ID}`;
  const dates = concatDateString(savedGuest?.guest_date);
  const line = '-----------------------------';
  const time = `\nThời gian(시간을): **${formatHourMinus(savedGuest?.TIME_IN)}-${formatHourMinus(savedGuest?.TIME_OUT)} ${dates}**`;
  const guest = `\nTên khách(방문자 이름): **${concatGuestInfo(savedGuest?.guest_info)}**`;
  const carNumber = savedGuest?.CAR_NUMBER
    ? ` - (${savedGuest?.CAR_NUMBER})`
    : '';
  const company = `\nCông ty(소속 회사): **${savedGuest?.COMPANY}${carNumber}**`;
  const reason = `\nLý do(이유): **${savedGuest?.REASON}**`;
  const personSeowon = `\nNgười bảo lãnh(담당자): **${savedGuest?.PERSON_SEOWON}**`;
  const department = `\nBộ phận(방문 부서): **${savedGuest?.DEPARTMENT}**\n`;

  return (
    line +
    ID +
    time +
    guest +
    company +
    reason +
    personSeowon +
    department +
    line
  );
};

export const sortDateString = (data) => {
  const result = data.sort(function (a, b) {
    a = a.split('/').reverse().join('');
    b = b.split('/').reverse().join('');
    return a > b ? 1 : a < b ? -1 : 0;
    // return a.localeCompare(b);         // <-- alternative
  });
  console.log('result', result);
  return result;
};
export const getMinMaxDateString = (dates) => {
  if (dates && dates?.length > 0) {
    // Chuyển đổi các chuỗi ngày tháng thành đối tượng Date để có thể so sánh
    const dateObjects = dates.map((dateString) => {
      const [day, month, year] = dateString.split('/');
      // Lưu ý: Trong JavaScript, tháng bắt đầu từ 0 (0 -> Tháng 1, 1 -> Tháng 2, v.v.)
      return new Date(year, month - 1, day);
    });

    // Tìm ngày nhỏ nhất và ngày lớn nhất
    const minDate = new Date(Math.min(...dateObjects));
    const maxDate = new Date(Math.max(...dateObjects));
    return {
      minDate: formatDate(minDate),
      maxDate: formatDate(maxDate),
    };
  }
  return null;
};

// Định dạng lại ngày nhỏ nhất và ngày lớn nhất thành chuỗi ngày tháng
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateHourMinus = (dateString) => {
  if (dateString) {
    const newDate = new Date(dateString);
    let hour  = newDate.getHours().toString();

    
    let minus  = newDate.getMinutes().toString();

    hour = parseInt(hour) < 10 ? `0${hour}` : `${hour}`;
    minus = parseInt(minus) < 10 ? `0${minus}` : `${minus}`;
    return `${hour}:${minus}`;
  }
  return '';
};
