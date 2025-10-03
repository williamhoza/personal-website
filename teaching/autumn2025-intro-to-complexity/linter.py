import sys

def main():
	file = open(sys.argv[1], "r")
	lineNumber = 1
	badLineNumbers = []
	
	print(f"\nAnalyzing the following script ({sys.argv[1]}):\n")

	for line in file:
		print(f"\033[94m{lineNumber:02d}  \033[0m{line.rstrip()}")
		if line.lstrip()[0:2] == "if" and line.rstrip()[-1] != ":": badLineNumbers.append(lineNumber)
		lineNumber = lineNumber + 1

	if len(badLineNumbers) == 0:
		print("\nVerdict: ACCEPT")
	else:
		print("\nVerdict: REJECT")
		print("Bad lines: " + str(badLineNumbers))

if __name__ == "__main__": main()