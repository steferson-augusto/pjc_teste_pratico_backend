const MessageError = {
    requestFail: [{
        field: 'general',
        message: 'Falha na requisição, tente novamente ou contate o administrador',
    }],
    loginFail: [{
        field: 'general',
        message: 'Falha no login, verifique suas credenciais',
    }],
    notFound: [{
        field: 'general',
        message: 'O item solicitado não foi encontrado',
    }],
    userInvalid: [{
        field: 'general',
        message: 'Usuário inválido',
    }]
}

const e = 'Falha na requisição, tente novamente ou contate o administrador'
const responseError = (kind = 'requestFail', errors = [], message = e, field = 'general' ) => {
    if (kind && MessageError[kind]) {
        return MessageError[kind]
    } else {
      const data = errors.length > 0 ? { error: errors } : { error: [{ message, field }] }
      return data
    }
}

module.exports = { MessageError, responseError }
