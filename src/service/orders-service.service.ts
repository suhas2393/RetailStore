import { Injectable , inject } from '@angular/core';
import { collectionData, Firestore ,collection, addDoc , doc ,deleteDoc} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { Orders } from 'src/models/orders.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersServiceService {

  constructor() { }

  firestore = inject(Firestore);
  ordersCollection = collection(this.firestore,'orders');

  getOrders() : Observable<Orders[]> {
    return collectionData(this.ordersCollection, {
      idField : 'id',

    }) as Observable<Orders[]>
  } 

  addOrders(OrderData : Orders) {
    const newOrder = OrderData;
    const promise = addDoc(this.ordersCollection,newOrder).then(
      (response) => response.id
    )
    return from(promise);
  } 

  deleteOrders(orderId : string): Observable <void>{
    const docRef = doc(this.firestore,'orders/'+orderId);
    const promise = deleteDoc(docRef);
    return from(promise);
  } 

}
