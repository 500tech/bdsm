import { Request } from 'api/models/request';
import find from 'lodash/find';
import EVENTS from 'api/constants/events';
import Emitter from 'api/emitter';

const capturedRequests = [];

export default class Requests {
  static capturePending(request) {
    const capturedRequest = new Request({
      id: request.id,
      method: request.method,
      url: request.url,
      params: request.body || request.params,
      headers: request.headers,
      origin: request.origin,
      response: null,
      startTime: request.startTime
    });

    capturedRequests.push(capturedRequest);

    Emitter.emit(EVENTS.REQUEST_CAPTURED, { requestId: request.id });
  }

  static setResponse(id, response, startTime) {
    const request = find(capturedRequests, { id });

    if (request) {
      request.response = {
        status: response.status || 200,
        delay: response.status === 0 ? 0 : (Date.now() - startTime),
        headers: response.headers || {},
        body: response.data || ''
      };

      Emitter.emit(EVENTS.RESPONSE_RECEIVED, { requestId: id });
    }
  }

  static setMock(requestId, mock) {
    const request = find(capturedRequests, { id: requestId });

    if (!request) {
      return;
    }

    request.setMockStatus(!mock.active || !mock.isActive ? 'inactive' : 'active', mock.id);
  }

  static capture(request, response = {}) {
    const capturedRequest = new Request({
      method: request.method,
      url: request.url,
      params: request.body || request.params,
      headers: request.headers,
      origin: request.origin,
      startTime: request.startTime,
      response: {
        status: response.status || 200,
        delay: response.status === 0 ? 0 : (Date.now() - request.startTime),
        headers: response.headers || {},
        body: response.data || ''
      }
    });

    capturedRequests.push(capturedRequest);
  }

  static get capturedRequests() {
    return capturedRequests;
  }

  static find(options) {
    return find(capturedRequests, options);
  }

  static update(id, url, name) {
    this.find({ id }).update(url, name);
  }
}
