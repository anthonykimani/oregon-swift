import { IResponse } from "../interfaces/IResponse";

class Controller {
  public static response(status: any, data?: any, errors?: string[]) {
    const _res: IResponse = {
      status: status.code,
      message: status.message,
      data: data || null,
      errors: errors || [],
    };
    return _res;
  }

  public static ex(error: unknown) {
    if (error instanceof Error) {
      return [error.message];
    }
    return [Controller._500.message];
  }

  protected static _200 = { code: 200, message: "OK" };
  protected static _201 = { code: 201, message: "Created" };
  protected static _400 = { code: 400, message: "Bad Request" };
  protected static _401 = { code: 401, message: "Unauthorized" };
  protected static _403 = { code: 403, message: "Forbidden" };
  protected static _404 = { code: 404, message: "Not Found" };
  protected static _408 = { code: 408, message: "Request Timeout" };
  protected static _409 = { code: 409, message: "Conflict" };
  protected static _429 = { code: 429, message: "Too Many Requests" };
  protected static _500 = { code: 500, message: "Internal Server Error" };
  protected static _503 = { code: 503, message: "Service Unavailable" };
}

export default Controller;
