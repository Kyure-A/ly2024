import { BusinessHours, InnerDate, ParsedQuery, Reserve } from "./types";
import { parseBusinessHours, parseQuery } from "./parser";
import {
  isReserveUnavailable,
  isTableCapacityOver,
  isTimeInclude,
  isTimeOver,
} from "./error";

const getTableNumber = (
  query: ParsedQuery,
  numberOfTables: number,
  tableCapacity: (tableNumber: number) => number,
) => {
  let capacity = 1000;
  let table = 1000;
  for (let i = 1; i <= numberOfTables; i++) {
    if (
      query.value.type === "issue-unspecified" &&
      tableCapacity(i) >= query.value.reservePeople
    ) {
      if (Math.min(capacity, tableCapacity(i)) === tableCapacity(i)) {
        capacity = Math.min(capacity, tableCapacity(i));
        table = i;
      } else if (tableCapacity(i) === capacity) {
        table = Math.min(table, i);
      }
    }
  }

  return table;
};

const outputRepository = (
  repository: Array<Reserve>,
  query: ParsedQuery,
  businessHours: BusinessHours,
  currentNumberOfTimes: (currentTime: number) => number,
) => {
  if (
    query.value.type === "time" && businessHours.numberOfTimes >= query.value.x
  ) {
    repository.sort((x, y) => x.tableNumber - y.tableNumber);
    repository.map((reserve) => {
      if (
        reserve.day === query.time.day &&
        reserve.numberOfTimes === currentNumberOfTimes(query.time.time)
      ) {
        console.log(
          "%d %s table %d = %s",
          reserve.day,
          query.time.formatTime(),
          reserve.tableNumber,
          reserve.id,
        );
      }
    });
  }
};

function main(lines: string[]) {
  const n: number = Number(lines[0]);

  const tableCapacity = (tableNumber: number): number => {
    const a: number[] = lines[1].split(" ").map((x) => Number(x));
    return a[tableNumber - 1];
  };

  const businessHours = parseBusinessHours(lines[2]);

  const currentNumberOfTimes = (currentTime: number): number => {
    for (let i = 0; i < businessHours.numberOfTimes; i++) {
      // 営業時間帯は半開区間
      if (
        businessHours.times[i].start <= currentTime &&
        currentTime < businessHours.times[i].end
      ) return i + 1;
    }
    return currentTime < businessHours.start
      ? 0
      : businessHours.numberOfTimes + 1;
  };

  // solve
  let repository: Array<Reserve> = [];
  let reservedTable: Array<number> = [];

  for (let i = 3; i < lines.length; i++) {
    const query = parseQuery(lines[i]);

    if (query === undefined) continue;

    if (query.value.type === "time") {
      businessHours.times.map((time) => {
        // 時間帯の開始時刻を表すクエリの処理
        if (time.start === query.time.time) {
          outputRepository(
            repository,
            query,
            businessHours,
            currentNumberOfTimes,
          );
        }
      });
    } else if (query.value.type === "issue-specified") {
      let isReserveSuccess = true;

      isReserveSuccess = isTableCapacityOver(query, tableCapacity) &&
        isTimeInclude(query, currentNumberOfTimes) &&
        isTimeOver(query, businessHours, currentNumberOfTimes);

      // テーブルが予約されているか
      reservedTable.map((tableNumber) => {
        if (
          query.value.type === "issue-specified" &&
          tableNumber === query.value.reserveTable
        ) {
          console.log(
            "%d %s Error: the table is occupied.",
            query.value.reserveDay,
            query.time.formatTime(),
          );
          isReserveSuccess = false;
        }
      });

      if (isReserveSuccess) { // !Number.isNaN(query.value.reserveDay) &&
        console.log(
          "%d %s %s",
          query.value.reserveDay,
          query.time.formatTime(),
          query.value.reserveId,
        );

        repository.push(
          {
            id: query.value.reserveId,
            day: query.value.reserveDay,
            numberOfTimes: query.value.reserveNumberOfTimes,
            people: query.value.reservePeople,
            tableNumber: query.value.reserveTable,
          } satisfies Reserve,
        );

        reservedTable.push(query.value.reserveTable);
      }
    } else if (query.value.type === "issue-unspecified") {
      let isReserveSuccess = true;
      isReserveSuccess = isTimeInclude(query, currentNumberOfTimes) &&
        isTimeOver(query, businessHours, currentNumberOfTimes) &&
        isReserveUnavailable(query, reservedTable, n);

      if (isReserveSuccess) {
        const unspecifiedTable = getTableNumber(query, n, tableCapacity);

        console.log(
          "%d %s %s %d",
          query.value.reserveDay,
          query.time.formatTime(),
          query.value.reserveId,
          unspecifiedTable,
        );

        repository.push(
          {
            id: query.value.reserveId,
            day: query.value.reserveDay,
            numberOfTimes: query.value.reserveNumberOfTimes,
            people: query.value.reservePeople,
            tableNumber: unspecifiedTable,
          } satisfies Reserve,
        );

        reservedTable.push(unspecifiedTable);
      }
    } else { // (query.value.type === "cancel")
      let isExist = false;
      let canCancel = false;
      repository.map((reserve) => {
        if (query.value.type !== "cancel") return;
        if (reserve.id === query.value.reserveId) isExist = true;
      });

      if (isExist && canCancel) {
        console.log(
          "%d %s Canceled %s",
          query.time.day,
          query.time.formatTime(),
          query.value.reserveId,
        );
        continue;
      }
      console.log(
        "%d %s Error: no such ticket is found.",
        query.time.day,
        query.time.formatTime(),
      );
    }
  }
}

function readFromStdin(): Promise<string[]> {
  return new Promise((resolve) => {
    let data: string = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (d) => {
      data += d;
    });
    process.stdin.on("end", () => {
      resolve(data.split("\n"));
    });
  });
}

readFromStdin().then(main);
