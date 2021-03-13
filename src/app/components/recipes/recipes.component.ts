import { Component, OnInit } from '@angular/core';
import { RecipeModel } from '@app/core/interfaces/recipe.model';
import { ApiService } from '@core/services/api/api.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {
  error: string = '';
  recipes: RecipeModel[] = [];
  currentLocalStorageRecipes: string | null = '';
  page: number = 1;
  searchForKeyword: string = '';
  searchKeywordModel: Subject<string> = new Subject<string>();
  currentLocalStorageKeyword: string | null = '';
  searchForIngredients: string[] = [];
  searchForIngredientBlank: string = '';
  searchIngredientModel: Subject<string> = new Subject<string>();
  currentLocalStorageIngredients: string | null = '';
  scrollPosition: number = 0;
  currentLocalStoragescrollPosition: string | null = '';

  constructor(private apiService: ApiService, private localStorageService: LocalStorageService) { }

  getRecipes() {
    this.apiService.getRecipesData(this.searchForKeyword, this.searchForIngredients, this.page)
      .subscribe(data => {
        this.recipes = this.recipes.concat(data);
        this.localStorageService.setItem('recipes', JSON.stringify(this.recipes));
        this.localStorageService.setItem('searchForKeyword', JSON.stringify(this.searchForKeyword));
        this.localStorageService.setItem('searchForIngredients', JSON.stringify(this.searchForIngredients));
      },
        error => {
          this.error = 'Something went wrong with getting recipes from RecipePuppy!';
        });
  }

  clearRecipesArray() {
    this.recipes = [];
    this.page = 1;
    this.localStorageService.removeItem('recipes');
    this.localStorageService.removeItem('page');
    this.localStorageService.removeItem('searchForKeyword');
    this.localStorageService.removeItem('searchForIngredients');
    this.localStorageService.removeItem('scrollPosition');
    this.getRecipes();
  }

  onScroll() {
    this.page++;
    this.localStorageService.setItem('page', JSON.stringify(this.page));
    this.scrollPosition = window.scrollY;
    this.localStorageService.setItem('scrollPosition', JSON.stringify(this.scrollPosition));
    this.getRecipes();
  }

  searchKeywordModelChanged(filterText: string) {
    // debounce filter text changes
    if (this.searchKeywordModel.observers.length === 0) {
      this.searchKeywordModel
        .pipe(debounceTime(1000), distinctUntilChanged())
        .subscribe(endDebounceKeyword => {
          this.searchForKeyword = endDebounceKeyword;
          this.clearRecipesArray();
        });
    }
    this.searchKeywordModel.next(filterText);
  }

  // Update ingredient list
  updateIngredient(ingredient: string) {
    if (this.searchForIngredients.indexOf(ingredient.trim()) === -1) {
      this.setIngredient(ingredient);
    } else {
      this.removeIngredient(ingredient);
    }
  }

  // Add ingredient to filters
  setIngredient(ingredient: string) {
    if (this.searchForIngredients.indexOf(ingredient.trim()) === -1) {
      this.searchForIngredients.push(ingredient.trim());
      this.clearRecipesArray();
    }
  }

  // Remove ingredient from filters
  removeIngredient(ingredient: string) {
    this.searchForIngredients.splice(this.searchForIngredients.indexOf(ingredient), 1);
    this.clearRecipesArray();
  }

  // Get class for currently active or non-active ingredient filter
  getIngredientClass(ingredient: string): string {
    switch (this.searchForIngredients.includes(ingredient.trim())) {
      case false:
        return 'tag';
      case true:
        return 'tag tag-active';
    }
  }

  checkLocalStorageRecipes(): string | null {
    this.currentLocalStorageRecipes = this.localStorageService.getItem('recipes');
    return this.currentLocalStorageRecipes;
  }

  checkLocalStorageKeyword(): string | null {
    this.currentLocalStorageKeyword = this.localStorageService.getItem('searchForKeyword');
    return this.currentLocalStorageKeyword;
  }

  checkLocalStorageIngredients(): string | null {
    this.currentLocalStorageIngredients = this.localStorageService.getItem('searchForIngredients');
    return this.currentLocalStorageIngredients;
  }

  checkLocalStorageScrollPosition(): string | null {
    this.currentLocalStoragescrollPosition = this.localStorageService.getItem('scrollPosition');
    return this.currentLocalStoragescrollPosition;
  }

  ngOnInit(): void {
    if(this.checkLocalStorageRecipes() !== null && this.currentLocalStorageRecipes !== null) {
      this.recipes = JSON.parse(this.currentLocalStorageRecipes);
      this.page = this.recipes.length/10;
      if(this.checkLocalStorageKeyword() !== null && this.currentLocalStorageKeyword !== null) {
        this.searchForKeyword = JSON.parse(this.currentLocalStorageKeyword);
      }
      if(this.checkLocalStorageIngredients() !== null && this.currentLocalStorageIngredients !== null) {
        this.searchForIngredients = (JSON.parse(this.currentLocalStorageIngredients));
      }
      if(this.checkLocalStorageScrollPosition() !== null && this.currentLocalStoragescrollPosition !== null) {
        this.scrollPosition = (JSON.parse(this.currentLocalStoragescrollPosition));
        window.scrollTo(0, Number(this.scrollPosition));
      }
    } else {
      this.getRecipes();
    }
  }

}
