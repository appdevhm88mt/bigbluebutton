import { RedisMessage } from '../types';
import {throwErrorIfNotModerator} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotModerator(sessionVariables);
  const eventName = 'CreateBreakoutRoomsCmdMsg';

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const body = {
    meetingId: routing.meetingId,
    record: input.record,
    captureNotes: input.captureNotes,
    captureSlides: input.captureSlides,
    durationInMinutes: input.durationInMinutes,
    sendInviteToModerators: input.sendInviteToModerators,
    rooms: input.rooms,
  };

  return { eventName, routing, header, body };
}
