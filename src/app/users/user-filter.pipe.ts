import { Pipe, PipeTransform } from '@angular/core';
import { User } from './interfaces/user';

@Pipe({
  name: 'userFilter'
})
export class UserFilterPipe implements PipeTransform {

  getUserByRole(user: User, role: string){
    return user.role.toLowerCase() == role.toLowerCase()
  }
  
  transform(users: User[], role: string) {
    if(role === ""){
      return users ;
    }
    return users.filter(user => this.getUserByRole(user, role));
  }

}
