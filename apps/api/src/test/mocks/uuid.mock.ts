// Mock for uuid module
export const v4 = () => '00000000-0000-4000-8000-000000000000';
export const v7 = () => '00000000-0000-7000-8000-000000000000';
export const NIL = '00000000-0000-0000-0000-000000000000';
export const validate = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
export const version = (uuid: string) => {
  if (!validate(uuid)) return NaN;
  return parseInt(uuid[14], 16);
};

export default {
  v4,
  v7,
  NIL,
  validate,
  version,
};
