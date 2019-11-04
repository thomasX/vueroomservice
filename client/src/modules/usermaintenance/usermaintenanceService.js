import Api from '@/services/Api'


export default {
  async getUser (id) {
    try {
       const user = await new Api().get(`User/${id}`)
      return user
    } catch {
      return alert('user not found')
    }
  }

}