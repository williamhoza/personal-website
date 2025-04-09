import sys
import json
import time
import math

def main():
    graph = json.load(open(sys.argv[1]))
    print(f"\nInput graph has {len(graph)} vertices. Searching for cliques...")
    findCliques(graph)

# Print out an adjacency matrix in a human-readable format
# Highlight the given induced subgraph
def printGraph(graph, subset):
    dim = len(graph)

    print(" ", end="")
    for j in range(dim):
        if subset[j] == 1:
            print(" ↓", end="")
        else:
            print("  ", end="")

    print("")

    for i in range(dim):
        if subset[i] == 1:
            print("→ ", end="")
        else:
            print("  ", end="")
        
        for j in range(dim):
            if (subset[i] == subset[j] == 1):
                print(f"\033[30m\033[107m{graph[i][j]}\033[0m ", end="")
            else:
                print(f"{graph[i][j]} ", end="")
        
        print("")

# Search for the largest clique in a given graph
def findCliques(graph):
    dim = len(graph)
    completed = 0
    total = pow(2, dim)
    totalDescription = summarizeNumber(total)
    biggestFound = None;
    sizeOfBiggestFound = 0;

    subset = []
    for i in range(dim):
        subset.append(0)

    overflow = False

    start = time.time()
    estimationStartPoint = None;
    completedAtEstimationStartPoint = 0;
    lastPrintTime = None

    while not overflow:
        size = 0
        for i in range(dim):
            size = size + subset[i]

        if size > sizeOfBiggestFound:
            clique = True

            for i in range(dim):
                for j in range(dim):
                    if (i != j) and (subset[i] == 1) and (subset[j] == 1) and (graph[i][j] == 0):
                        clique = False
                        break
                if not clique:
                    break
        
            if clique:
                biggestFound = subset.copy()
                sizeOfBiggestFound = size

        overflow = increment(subset)

        completed = completed + 1
        now = time.time()
        if now - start > 3 and estimationStartPoint == None:
            estimationStartPoint = now
            completedAtEstimationStartPoint = completed

        if lastPrintTime == None and now - start > 1:
            lastPrintTime = start
            print("\n\n\n\n")

        if lastPrintTime != None and now - lastPrintTime > 1:
            lastPrintTime = now
            print(f"\033[4A\033[K{round(completed/total*100,1)}% complete")
            print(f"\033[KBiggest clique found so far has {sizeOfBiggestFound} vertices")
            print(f"\033[K{summarizeNumber(completed)} cases checked out of {totalDescription} total cases")

            if estimationStartPoint != None and now - estimationStartPoint > 3:
                elapsed = now - estimationStartPoint
                remainingSeconds = (total - completedAtEstimationStartPoint) * (elapsed / (completed - completedAtEstimationStartPoint)) - elapsed
                print(f"\033[KEstimated time remaining: {summarizeSeconds(remainingSeconds)}")
            else:
                print()
    
    print(f"\nSearch complete. The largest cliques in this graph have {sizeOfBiggestFound} vertices. One such clique is highlighted below.\n")
    printGraph(graph, biggestFound)

def summarizeNumber(num):
    if (num < 1000): return f"{round(num)}"
    num = num / 1000
    if (num < 1000): return f"{round(num)} thousand"
    num = num / 1000
    if (num < 1000): return f"{round(num)} million"
    num = num / 1000
    if (num < 1000): return f"{round(num)} billion"
    num = num / 1000
    if (num < 1000): return f"{round(num)} trillion"
    num = num / 1000
    if (num < 1000): return f"{round(num)} quadrillion"
    num = num / 1000
    if (num < 1000): return f"{round(num)} quintillion"
    return f"{summarizeNumber(num)} quintillion"

def summarizeSeconds(seconds):
    if (seconds < 100): return f"{round(seconds)} seconds"
    minutes = seconds / 60
    if (minutes < 100): return f"{round(minutes)} minutes"
    hours = minutes / 60
    if (hours < 100): return f"{round(hours)} hours"
    days = hours / 24
    if (days < 100): return f"{round(days)} days"
    weeks = days / 7
    if (weeks < 100): return f"{round(weeks)} weeks"
    years = days / 365.2425 # average length of a year accounting for leap years
    return f"{summarizeNumber(years)} years"

# Increment a given sequence of bits and return true if there was an overflow
# Low-order bits are at the beginning
def increment(bitsequence, i=0):
    if i >= len(bitsequence):
        return True

    if bitsequence[i] == 0:
        bitsequence[i] = 1
        return False
    else:
        bitsequence[i] = 0
        return increment(bitsequence, i+1)


if __name__ == "__main__":
    main()
