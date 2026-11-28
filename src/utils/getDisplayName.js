import { textOrNull } from "./text";

/*
  The one display-name rule for users and patients:
    fullName -> userName -> email
  Null, empty and blank values count as missing. `userName` and `fullName` stay
  separate fields on the data; this only decides what to show.
*/
const getDisplayName = (person, fallback = "Unnamed user") =>
  textOrNull(person?.fullName) ??
  textOrNull(person?.userName) ??
  textOrNull(person?.email) ??
  fallback;

export default getDisplayName;
