import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@2ntickets/common';
import { PasswordManager } from '../utils';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Invalid Email Format'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must include a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (
      !existingUser ||
      !(await PasswordManager.compare(existingUser.password, password))
    )
      throw new BadRequestError('Invalid Credentials');

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = { jwt: userJwt };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
