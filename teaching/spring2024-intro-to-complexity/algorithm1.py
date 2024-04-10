import sys
import json
import time

def main():
    s = open(sys.argv[1]).read()
    print("\nINPUT: " + s)
    print("Searching...")
    decomposition = findDecomposition(s)
    if decomposition == None:
        print("\nOUTPUT: REJECT")
    else:
        print("\nOUTPUT: ACCEPT, because of the following decomposition: ")
        print("\n" + s + " = " + "".join(["(" + s[0:len(s)//2] + " " + s[len(s)//2:] + ")" for s in decomposition]))


# Search for a decomposition of s as a concatenation of squares
def findDecomposition(s):
    completed = 0
    total = pow(2, len(s) // 2 - 1)

    bitsequence = []
    for i in range(len(s) // 2 - 1):
        bitsequence.append(0)

    overflow = False

    start = time.time()
    lastprint = start

    while not overflow:
        validDecomposition = True
        splitpoints = [0] + [2*(i + 1) for i in range(len(s) // 2 - 1) if bitsequence[i] == 1] + [len(s)]
        decomposition = [s[splitpoints[i]:splitpoints[i + 1]] for i in range(len(splitpoints) - 1)]
        for i in range(len(decomposition)):
            if not isSquare(decomposition[i]):
                validDecomposition = False
                break
        
        if validDecomposition:
            return decomposition

        overflow = increment(bitsequence)

        completed = completed + 1
        now = time.time()
        if now - lastprint > 1:
            elapsed = now - start
            lastprint = now
            remainingSeconds = total * (elapsed / completed) - elapsed
            print("  Estimated time remaining: " + summarizeSeconds(remainingSeconds))

    return None


# Check whether w has the form w = xx
def isSquare(w): 
    x = w[0:len(w)//2]
    return w == x + x

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
    if (years < 10000): return f"{round(years)} years"
    if (years < 10000000): return f"{round(years / 1000)} thousand years"
    return f"{round(years / 1000000)} million years"

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
