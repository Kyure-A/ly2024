import { BusinessHours, ParsedQuery, Reserve } from "./types";

export const isTableCapacityOver = (
  query: ParsedQuery,
  tableCapacity: (tableNumber: number) => number,
) => {
  if (
    query.value.type === "issue-specified" &&
    query.value.reservePeople > tableCapacity(query.value.reserveTable)
  ) {
    console.log(
      "%d %s Error: the maximum number of people at the table has been exceeded.",
      query.value.reserveDay,
      query.time.formatTime(),
    );
    return false;
  }
  return true;
};

// 現在の時刻が予約時間帯に含まれる場合
export const isTimeInclude = (
  query: ParsedQuery,
  currentNumberOfTimes: (currentTime: number) => number,
) => {
  if (
    (query.value.type === "issue-specified" ||
      query.value.type === "issue-unspecified") &&
    query.value.reserveNumberOfTimes == currentNumberOfTimes(query.time.time)
  ) {
    console.log(
      "%d %s Error: the current slot cannot be specified.",
      query.value.reserveDay,
      query.time.formatTime(),
    );
    return false;
  }
  return true;
};

export const isTimeOver = (
  query: ParsedQuery,
  businessHours: BusinessHours,
  currentNumberOfTimes: (currentTime: number) => number,
) => {
  if (
    (query.value.type === "issue-specified" ||
      query.value.type === "issue-unspecified") &&
    (businessHours.numberOfTimes < currentNumberOfTimes(query.time.time) ||
      query.value.reserveDay < query.time.day)
  ) {
    console.log(
      "%d %s Error: a past time cannot be specified.",
      query.value.reserveDay,
      query.time.formatTime(),
    );
    return false;
  }
  return true;
};

export const isReserveUnavailable = (
  query: ParsedQuery,
  reservedTable: Array<number>,
  numberOfTables: number,
) => {
  if (
    query.value.type === "issue-unspecified" &&
    reservedTable.length >= numberOfTables
  ) {
    console.log(
      "%d %s Error: no available table is found.",
      query.value.reserveDay,
      query.time.formatTime(),
    );
    return false;
  }
  return true;
};
