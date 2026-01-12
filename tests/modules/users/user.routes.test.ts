const post = jest.fn();
const get = jest.fn();
jest.mock('express', () => ({
  Router: () => ({
    post,
    get,
  })
}))

const asyncHandler = jest.fn(() => 'async');
jest.mock('~/core/asyncHandler', () => ({
  asyncHandler
}))

const validateRequest = jest.fn(() => 'validate');
jest.mock('~/core/validate/validateRequest', () => ({
  validateRequest
}))

const UserController = {
  register: 'register',
  list: 'list'
};

jest.mock('~/modules/users/user.controller', () => ({
  UserController
}))

const RegisterSchema = 'RegisterSchema'
jest.mock('~/modules/users/user.validation', () => ({
  RegisterSchema
}))

describe('UserRouter', () => {
  it('wires user route', async () => {
    await import('~/modules/users/user.routes')

    expect(post).toHaveBeenCalledWith('/register', 'validate', 'async');
    expect(get).toHaveBeenCalledWith('/list', 'async');

    expect(validateRequest).toHaveBeenCalledWith(RegisterSchema);
    expect(asyncHandler).toHaveBeenCalledWith(UserController.register);
    expect(asyncHandler).toHaveBeenCalledWith(UserController.list);

  })
})
