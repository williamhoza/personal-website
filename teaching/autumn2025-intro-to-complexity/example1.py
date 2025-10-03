import sys

def main():
	# This style is encouraged
	if sys.argv[1] == "Hello":
		print("Goodbye")

	# This style is legal but discouraged
	if sys.argv[1] == "Hi": print("Bye")

if __name__ == "__main__": main()