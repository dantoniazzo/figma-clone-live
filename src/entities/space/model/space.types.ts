export interface ISpace {
  id: string;
  name: string;
  createdAt: Date;
  type: SpaceType;
}

export enum SpaceType {
  DESIGN = "design",
  FIGJAM = "figjam",
}
