
import sys

def main():
	file = open(sys.argv[1], "r")
	fileContents = file.read()
	wordCount = len(fileContents.split())
	if wordCount > 100 and wordCount < 300:
		print("Accept")
	else:
		print("Reject")

if __name__ == "__main__":
	main()
