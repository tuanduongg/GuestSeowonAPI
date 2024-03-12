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
    let check = true;
    arr.map((item, index) => {
      if (index < 3) {
        if (index === arr.length - 1) {
          result += item?.FULL_NAME;
        } else {
          result += item?.FULL_NAME + ',';
        }
      } else {
        check = false;
      }
    });
    if (!check) {
      return result + '...';
    }
    return result;
  }
  return '';
};
