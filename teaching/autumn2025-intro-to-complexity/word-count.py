import sys

def main():
	file = open(sys.argv[1], "r")
	fileContents = file.read()
	wordCount = len(fileContents.split())

	print("\n\033[94mRequirement: Submissions must be 100-300 words.")
	print(f"\nSubmission {sys.argv[1]}:\n\033[92m")
	print(fileContents)
	print(f"\033[94m\nThe submission {sys.argv[1]} has {wordCount} words.\n")
	if wordCount > 100 and wordCount < 300:
		print("Verdict: ACCEPT.\033[0m")
	else:
		print("Verdict: REJECT.\033[0m")

if __name__ == "__main__":
	main()