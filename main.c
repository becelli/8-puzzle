#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "./states.h"
#include <time.h>
// use time to seed random number generator


//finds the position of the empty square from the square puzzle
int findEmptySpace(int board[9]){
    int i;
    for(i = 0; i < 9; i++){
        if(board[i] == 9){
            return i;
        }
    }
}

//check if the puzzle has been solved
int isSolved(int board[9]){
    int i;
    int solved[9] = {1,2,3,4,5,6,7,8,9};
    //check all pieces, but doesn't check the empty space
    if(memcmp(board, solved, 9*sizeof(int)) == 0){
        return 1;
    }else{
        return 0;
    }
}

//move piece from the correspondent direction to the empty space (pos)
int movePiece(int pos, int direction, int* board){
    int newPos;
    switch(direction){
        //Move the piece to the upper square
        case 0:
            newPos = pos - 3;
            board[pos] = board[newPos];
            board[newPos] = 9;
            break;
        //Move the piece to the lower square
        case 1:
            newPos = pos + 3;
            board[pos] = board[newPos];
            board[newPos] = 9;
            break;
        //Move the piece to the left square
        case 2:
            newPos = pos - 1;
            board[pos] = board[newPos];
            board[newPos] = 9;
            break;
        //Move the piece to the right square
        case 3:
            newPos = pos + 1;
            board[pos] = board[newPos];
            board[newPos] = 9;
            break;
        //This case shouldn't happen, so just end the program
        default:
            printf("ERROR!");
            exit(1);
    }
    return newPos;
}

//return an array with all the possible moves of the empty space
int *listPossibleMoves(int *board, int emptyPos){
    int *possibleMoves = malloc(4*sizeof(int));
    int i = 0;
    //a move is valid if the piece stays on the board after moving it
    //check if moving up is valid
    if((emptyPos - 3) >= 0){
        possibleMoves[i] = 0;
        i++;
    }
    //check if moving down is valid
    if((emptyPos + 3) < 9){
        possibleMoves[i] = 1;
        i++;
    }
    //check if moving left is valid
    if( ((emptyPos%3) - 1) >= 0){
        possibleMoves[i] = 2;
        i++;
    }
    //check if moving right is valid
    if( ((emptyPos%3) + 1) < 3){
        possibleMoves[i] = 3;
        i++;
    }
    //fill with invalid moves until the end of the array
    for(; i < 4; i++){
        possibleMoves[i] = -1;
    }
    return possibleMoves;
}

int calculateDistance(int board[9]){
    int i, d = 0;
    if(isSolved(board)){
        return 0;
    }
    for(i = 0; i < 9; i++){
        d += abs(i+1 - board[i]);
    }
    return d;
}


int chooseBoard(int possibleBoards[4][9], int d[4], stateList *list){
    int i;
    int best = 0;
    //check if all the moves have been tested once
    int possibleMoves = 0, exhausted = 1;
    int lowestD = 999;
    for(i = 0; i < 4; i++){
        if(d[i] == 999){
            break;
        }
        if(lowestD > d[i]){
            if(!isInList(list, possibleBoards[i])){
                best = i;
                lowestD = d[i];
                exhausted = 0;
            }
        }
        possibleMoves++;
    }
    //if all moves have been tested, choose a random possible move
    if(exhausted){
        best = rand()%possibleMoves;
        //printf("position has been exhausted, choosing random position %d\n", best);
    }
    return best;
}

void printBoard(int board[9]){
    int i, j;
    printf("\n");
    for(i = 0; i < 3; i++){
        for(j = 0; j < 3; j++){
            printf("%d ", board[3*i + j]);
        }
        printf("\n");
    }
}

int listPossibleBoards(int board[9], int possibleBoards[4][9]){
    int emptyPos = findEmptySpace(board);
    int *possibleMoves = listPossibleMoves(board, emptyPos);
    int i;
    for(i = 0; possibleMoves[i] != -1 && i < 4; i++){
        memcpy(possibleBoards[i], board, sizeof(int)*9);
        movePiece(emptyPos, possibleMoves[i], possibleBoards[i]);
    }
    free(possibleMoves);
    return i;
}

void scrambleBoard(int board[9]){
    int j, maxIt = 50;
    for(j = 0; j < maxIt; j++){
        int emptyPos = findEmptySpace(board);
        int *possibleMoves = listPossibleMoves(board, emptyPos);
        int i;
        int possibleBoards[4][9];
        int d[4] = {999, 999, 999, 999};
        for(i = 0; possibleMoves[i] != -1 && i < 4; i++){
            memcpy(possibleBoards[i], board, sizeof(int)*9);
            movePiece(emptyPos, possibleMoves[i], possibleBoards[i]);
            d[i] = calculateDistance(possibleBoards[i]);
        }
        free(possibleMoves);
        int randomPos = rand()%(i);
        //copy the random movement to the board
        memcpy(board, possibleBoards[randomPos], sizeof(int)*9);
    }
    // printBoard(board);
}

//uses one deep layer to solve the puzzle
int solveOneLayer(int board[9]){
    int moveCount = 0;
    stateList *list = newStateList();
    addArrayToList(list, board);
    do{
        int i;
        int possibleBoards[4][9];
        int numMoves = listPossibleBoards(board, possibleBoards);
        int d[4] = {999, 999, 999, 999};
        for(i = 0; i < numMoves; i++){
            d[i] = calculateDistance(possibleBoards[i]);
        }
        int best = chooseBoard(possibleBoards, d, list);
        //copy the best solution to the board
        memcpy(board, possibleBoards[best], sizeof(int)*9);
        addArrayToList(list, board);
        moveCount++;
        /*if((moveCount % 500) == 0){
            printBoard(board);
            getchar();
            //printList(list);
        }*/
    }while(!isSolved(board));
    freeList(list);
    // printf("solved!\n");
    return moveCount;
}

int solveTwoLayers(int board[9]){
    int moveCount = 0;
    stateList *list = newStateList();
    addArrayToList(list, board);
    do{
        int i;
        int possibleBoards[4][9];
        int numMoves = listPossibleBoards(board, possibleBoards);
        int d[4] = {999, 999, 999, 999};
        for(i = 0; i < numMoves; i++){
            d[i] = calculateDistance(possibleBoards[i]);
        }
        int best = chooseBoard(possibleBoards, d, list);
        //copy the best solution to the board
        memcpy(board, possibleBoards[best], sizeof(int)*9);
        addArrayToList(list, board);
        moveCount++;
        /*if((moveCount % 500) == 0){
            printBoard(board);
            getchar();
            //printList(list);
        }*/
    }while(!isSolved(board));
    freeList(list);
    return moveCount;
}

int main(){
    //int board[9] = {4, 3, 8, 9, 7, 2, 6, 1, 5};
    // seed
    int mean_movements = 0;
    srand(time(NULL));
    for (int i = 0; i < 100; i++){    
        int board[9] = {1,2,3,4,5,6,7,8,9};
        scrambleBoard(board);
        int moves = solveOneLayer(board);
        mean_movements += moves;
    }
    printf("mean of  movements: %d\n", mean_movements/100);
    return 0;
}