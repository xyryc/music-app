import {
  DropdownAlertData,
  DropdownAlertType,
} from "react-native-dropdownalert";

let alertRef: (data?: DropdownAlertData) => Promise<DropdownAlertData> = async (
  data = {},
) => data;

export function setAlertFunction(
  fn: (data?: DropdownAlertData) => Promise<DropdownAlertData>,
) {
  alertRef = fn;
}

export function showAlert(data: DropdownAlertData) {
  return alertRef(data);
}

export function showSuccess(title: string, message?: string) {
  return showAlert({ type: DropdownAlertType.Success, title, message });
}

export function showError(title: string, message?: string) {
  return showAlert({ type: DropdownAlertType.Error, title, message });
}

export function showInfo(title: string, message?: string) {
  return showAlert({ type: DropdownAlertType.Info, title, message });
}

export function showWarn(title: string, message?: string) {
  return showAlert({ type: DropdownAlertType.Warn, title, message });
}
