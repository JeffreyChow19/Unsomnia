import prisma from "../../../utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import {setCookie} from "cookies-next"
import createJWT from "../../../utils/createJWT";
import { UserOpaque } from "../../../types/types";
import serverConfig from "../../../config";
import bcrypt from 'bcrypt';

export default async function handler (req : NextApiRequest, res : NextApiResponse) {
    const {username, password} = req.body;

    const users = await prisma.user.findMany({
        where : {
            username : username
        }
    })

    if (users.length === 0) {
        return res.status(400).send({message : "User doesn't exist"})
    }

    const userFound = users[0];

    if (!(await bcrypt.compare(password, userFound.password))) {
        return res.status(400).send({message : "Wrong password"})
    }

    setCookie("token" ,createJWT( {username, email : userFound.email} as UserOpaque), serverConfig.cookieSettings)

    return res.status(200).send({message : "Login succesful"})
}