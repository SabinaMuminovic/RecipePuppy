import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecipeModel, RecipeModelApi } from '@app/core/interfaces/recipe.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  // apiURL: string = 'http://www.recipepuppy.com/api'

  constructor(private httpClient: HttpClient) {}

  public getRecipesData(keyword: string, ingredients: string[], page: number): Observable<RecipeModel[]> {
    return this.httpClient.get('/api/', {
        params: {
          'i': ingredients.join(','),
          'q': keyword,
          'p': page.toString()
        }
      }).pipe(
        map( response => {
          let dataResults = (response as RecipeModelApi).results;
          dataResults.map(res => {
            let ingredientArray = res.ingredients.toString().split(',');
            res.ingredients = ingredientArray;
          });
          return dataResults;
        })
      );
   }

}
