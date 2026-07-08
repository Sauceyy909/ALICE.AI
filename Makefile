# Makefile for ALICE - High-Fidelity Kernel & OS Synthesis CLI Agent

CC = gcc
CFLAGS = -Wall -O3
TARGET = alice
PREFIX = /usr/local

all: $(TARGET)

$(TARGET): alice.c
	$(CC) $(CFLAGS) -o $(TARGET) alice.c

clean:
	rm -f $(TARGET)

install: $(TARGET)
	install -D -m 0755 $(TARGET) $(DESTDIR)$(PREFIX)/bin/$(TARGET)

uninstall:
	rm -f $(DESTDIR)$(PREFIX)/bin/$(TARGET)

.PHONY: all clean install uninstall
