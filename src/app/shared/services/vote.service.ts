import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Vote } from '../domain/vote';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import { IsOnlineService } from './is-online.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class VoteService {
  private ENDPOINT = environment.endpoint;

  constructor(private http: HttpClient, isOnlineSvc: IsOnlineService) {
    isOnlineSvc.isOnline.distinctUntilChanged().subscribe(status => {
      if (status) {
        this.getTheVotes().subscribe(votes => {
          this._votes.next(votes);
        });
        this.socketInit();
      }
    });
  }

  private _votes = new BehaviorSubject<Vote[]>([]);
  public votes = this._votes.asObservable();

  getTheVotes(): Observable<Vote[]> {
    const params = new HttpParams().set(
      'since',
      this.getHighestVoteId().toString()
    );
    return this.http.get<Vote[]>(this.ENDPOINT + '/votes', { params });
  }
  getHighestVoteId(): number {
    const ids = this._votes.getValue().map(v => v.id);
    if (ids.length > 0) {
      return Math.max(...ids);
    } else {
      return 0;
    }
  }
  appendAndPublishTheVotes(votes: Vote[]): void {
    const currentVotes = this._votes.getValue();
    currentVotes.unshift(...votes);
    this._votes.next(currentVotes);
  }

  socketInit() {
    const ws = new WebSocket(environment.websocketEndpoint);

    const subj = new Subject<Vote>();
    ws.onmessage = msg => this.appendAndPublishTheVotes([JSON.parse(msg.data)]);
    ws.onopen = () => {
      ws.send(JSON.stringify({ token: localStorage.getItem('access_token') }));
    };
    ws.onclose = () => {};
  }
}
