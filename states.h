#ifndef states
#define states
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

typedef struct _state{
    int *array;
    struct _state *next;
}state;

typedef struct _stateList{
    state *first;
    state *final;
}stateList;

stateList *newStateList(){
    stateList *newList = malloc(sizeof(stateList));
    newList->first = NULL;
    newList->final = NULL;
    return newList; 
}

stateList *addArrayToList(stateList *list, int *newArray){
    state *newState = malloc(sizeof(state));
    int *array = malloc(9*sizeof(int));
    int i;
    memcpy(array, newArray, 9*sizeof(int));
    newState->array = array;
    if(list->final != NULL){
        (list->final)->next = newState;
        list->final = newState;
    }else{
        list->final = newState;
        list->first = newState;
    }
    newState->next = NULL;
    return list;
}

int isInList(stateList *list, int board[9]){
    int i;
    state *curState = list->first;
    while(curState != NULL){
        int *board2 = curState->array;
        if(memcmp(board, board2, 9*sizeof(int)) == 0){
            return 1;
        }
        curState = curState->next;
    }
    return 0;
}

void freeList(stateList *list){
    state *curState = list->first;
    while(curState != NULL){
        state *tempState = curState;
        free(curState->array);
        curState = curState->next;
        free(tempState);
    }
}

#endif