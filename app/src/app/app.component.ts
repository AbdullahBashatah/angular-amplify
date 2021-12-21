import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APIService, Restaurant} from './API.service';
import Amplify, { Auth, Hub, Logger } from 'aws-amplify';
import { AmplifyService }  from 'aws-amplify-angular';
import { isDevMode } from '@angular/core';



Hub.listen('auth', (data) => {
  const { payload } = data;
  //this.onAuthEvent(payload);           
  console.log('A new auth event has happened: ', new Date(), data.payload);
})



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  
  title = 'amplify-angular-app';
  public createForm: any;

  public signInForm: any;

  /* declare restaurants variable */
  /* declare restaurants variable */
  restaurants: Array<Restaurant> = []!;

  constructor(private api: APIService, private fb: FormBuilder, private amplifyService: AmplifyService) {
    console.log('is dev mode',isDevMode());

   }

  async ngOnInit() {

    
    console.log('subscribing');
    this.amplifyService.authStateChange$.subscribe(authSate => {
      console.log('receieved event', new Date(), authSate);
    })
    this.signInForm = this.fb.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
    })
    console.log(new Date());
    this.createForm = this.fb.group({
      'name': ['', Validators.required],
      'description': ['', Validators.required],
      'city': ['', Validators.required]
    });
    this.api.ListRestaurants().then(event => {
      this.restaurants = event.items as Array<Restaurant>;
    });
  
    try{
      let res = await Auth.currentAuthenticatedUser();
      console.log('fetching', res);
      }catch(err){
        console.log(err);
      }
    /* subscribe to new restaurants being created */
    this.api.OnCreateRestaurantListener.subscribe( (event: any) => {
      const newRestaurant = event.value.data.onCreateRestaurant;
      this.restaurants = [newRestaurant, ...this.restaurants];
    });
  }

  public signIn(userinfo: any) {

         Auth.signIn(userinfo.username, userinfo.password).then((res)=>{console.log(res)}).catch( err=> console.log(err));
  }

  public signOut(){
    Auth.signOut();
  }

  public onLogin(){
    Auth.federatedSignIn();
  }
  public onCreate(restaurant: Restaurant) {
    this.api.CreateRestaurant(restaurant).then(event => {
      console.log('item created!');
      this.createForm.reset();
    })
    .catch(e => {
      console.log('error creating restaurant...', e);
    });
  }
}