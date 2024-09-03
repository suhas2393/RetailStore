import { Injectable , inject } from '@angular/core';
import { collectionData, Firestore ,collection, addDoc} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { Users } from 'src/models/users.model';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  constructor() { }

  firestore = inject(Firestore);
  userCollection = collection(this.firestore,'users');

  getUsers() : Observable<Users[]> {
    return collectionData(this.userCollection, {
      idField : 'id',

    }) as Observable<Users[]>
  } 

  addUsers(userData : Users) {
    const newUser = userData;
    const promise = addDoc(this.userCollection,newUser).then(
      (response) => response.id
    )
    return from(promise);
  } 
  
}
