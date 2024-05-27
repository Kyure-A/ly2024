import { parseTime } from "./parser";

export class InnerDate {
  day: number;
  time: number;
  constructor(day: number, time: string) {
    this.day = day;
    this.time = parseTime(time);
  }
  formatTime(): string {
    const hours = Math.trunc(this.time / 60);
    const minutes = this.time % 60;
    const hours_str = (hours < 10)
      ? ("0" + hours.toString())
      : hours.toString();
    const minutes_str = (minutes < 10)
      ? "0" + minutes.toString()
      : minutes.toString();
    return hours_str + ":" + minutes_str;
  }
}

export type BusinessHours = {
  numberOfTimes: number; // 問題文中の k を指す
  start: number;
  end: number;
  times: Array<{
    start: number;
    end: number;
  }>;
};

export type Reserve = {
  id: string;
  day: number;
  numberOfTimes: number;
  people: number;
  tableNumber: number;
};

type Time = {
  type: "time";
  x: number;
};

type IssueSpecified = {
  type: "issue-specified";
  reserveId: string;
  reserveDay: number;
  reserveNumberOfTimes: number;
  reservePeople: number;
  reserveTable: number;
};

type IssueUnSpecified = {
  type: "issue-unspecified";
  reserveId: string;
  reserveDay: number;
  reserveNumberOfTimes: number;
  reservePeople: number;
};

type Cancel = {
  type: "cancel";
  reserveId: string;
};

export type ParsedQuery = {
  time: InnerDate;
  value: Time | IssueSpecified | IssueUnSpecified | Cancel;
};
