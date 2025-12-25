import { SetMetadata } from '@nestjs/common';

export const SERIALIZE_KEY = 'serialize';
export const Serialize = (dto: any) => SetMetadata(SERIALIZE_KEY, dto);
