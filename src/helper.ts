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
        result += item?.FULL_NAME + ',';
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
