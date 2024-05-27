import { BusinessHours, InnerDate, ParsedQuery } from "./types";

export function parseTime(time: string | undefined): number {
  if (time !== undefined) {
    return Number(time.split(":")[0]) * 60 + Number(time.split(":")[1]);
  }
  return 0;
}

export function parseBusinessHours(line: string): BusinessHours {
  const splitted = line.split(" ");

  let result = {
    numberOfTimes: Number(splitted[1]),
    start: parseTime(splitted[0].split("-")[0]),
    end: parseTime(splitted[0].split("-")[1]),
    times: [] as any,
  };

  for (let i = 2; i < splitted.length; i++) {
    const start: number = parseTime(splitted[i].split("-")[0]);
    const end: number = parseTime(splitted[i].split("-")[1]);
    result.times.push({ start: start, end: end });
  }
  return result;
}

export function parseQuery(line: string): ParsedQuery | undefined {
  const splitted = line.split(" ");
  const queryTime = new InnerDate(Number(splitted[0]), splitted[1]);
  const queryType = splitted[2];

  if (queryType == "time") {
    return {
      time: queryTime,
      value: {
        type: "time",
        x: Number(splitted[3]),
      },
    } satisfies ParsedQuery;
  } else if (queryType == "issue-specified") {
    const reserveId: string = splitted[3];
    const reserveDay = Number(splitted[4]);
    const reserveNumberOfTimes = Number(splitted[5]);
    const reservePeople = Number(splitted[6]);
    const reserveTable = Number(splitted[7]);

    return {
      time: queryTime,
      value: {
        type: "issue-specified",
        reserveId: reserveId,
        reserveDay: reserveDay,
        reserveNumberOfTimes: reserveNumberOfTimes,
        reservePeople: reservePeople,
        reserveTable: reserveTable,
      },
    } satisfies ParsedQuery;
  } else if (queryType == "issue-unspecified") {
    const reserveId: string = splitted[3];
    const reserveDay = Number(splitted[4]);
    const reserveNumberOfTimes = Number(splitted[5]);
    const reservePeople = Number(splitted[6]);

    return {
      time: queryTime,
      value: {
        type: "issue-unspecified",
        reserveId: reserveId,
        reserveDay: reserveDay,
        reserveNumberOfTimes: reserveNumberOfTimes,
        reservePeople: reservePeople,
      },
    } satisfies ParsedQuery;
  } else if (queryType == "cancel") {
    return {
      time: queryTime,
      value: {
        type: "cancel",
        reserveId: splitted[3],
      },
    } satisfies ParsedQuery;
  }

  return undefined;
}
