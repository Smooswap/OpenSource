export enum AllRoutes {
  Swap = 'Swap',
  History = 'History',
}

export const routeInitState: AllRoutes = AllRoutes.Swap;

export const routeReducer = (state: AllRoutes, action) => {
  const { type, payload } = action;
  if (!type) throw 'action error, no type';

  switch (type) {
    case 'updatePath':
      return payload;
    default:
      return state;
  }
}