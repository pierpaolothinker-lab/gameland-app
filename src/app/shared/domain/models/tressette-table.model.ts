import { ICardIT } from './cardIT.model';

export type TressettePosition = 'SUD' | 'NORD' | 'EST' | 'OVEST';

export interface TressettePlayer {
  username: string;
  position: TressettePosition;
}

export interface TressettePoints {
  teamSN: number;
  teamEO: number;
}

export type TressetteStatus = 'waiting' | 'in_game' | 'ended';

export interface TressetteTableView {
  tableId: string;
  owner: string;
  players: TressettePlayer[];
  isComplete: boolean;
  points: TressettePoints;
  status: TressetteStatus;
  myHand?: ICardIT[];
}

export interface TressetteApiError {
  error: {
    code: string;
    message: string;
  };
}
