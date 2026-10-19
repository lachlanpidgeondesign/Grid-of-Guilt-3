rule trace unavailable

`gradeNoGuess` returns only `solvable` and suspect `order`; it does not expose which deduction rule fired at each step. Source changes in `src/app/generator/constraintSolver.ts` would be required to emit a per-step rule trace.

`roomLabelsClash` is not exported from `src/app/generator/GeneratorGame.tsx`, so this script copies `computeRoomLabelLayout` and `roomLabelsClash` verbatim into `scripts/summarise.ts` and reuses the real exported `doorSuppressedEdgeSet` helper.

## easy-1

- ID: easy-1
- Difficulty: easy
- N: 5
- roomLabelsClash: true
- Starter: Dylan (4,2)
- Crime scene: (4,5)
- Murderer: Eve

### Room Map

```text
A A A B C
A B B B C
A D D C C
D D D C E
D D E E E

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar
```

### Doors and Windows

door (2,4)|(3,4), door (4,4)|(5,4), door (4,3)|(4,4), window (2,1) left, window (5,5) bottom, window (3,1) left

### Solution Grid

```text
A . . . .
. . B . .
. . . . C
. D . . .
. . . E .
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Ben: Was confirmed in the Ballroom all evening.
- Cole: Was nowhere near any windows.
- Eve: Was seen lingering near a doorway.

### Clue Type Counts

near-door: 1, near-window: 2, room: 2

### Deduction Trace

```text
solvable: true
order: Dylan -> Amy -> Ben -> Eve -> Cole
murderer last in order: no
```

## easy-2

- ID: easy-2
- Difficulty: easy
- N: 5
- roomLabelsClash: true
- Starter: Cole (3,1)
- Crime scene: (1,3)
- Murderer: Amy

### Room Map

```text
C C A A A
C B B A A
C C C A A
C E D D D
E E E E D

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar
```

### Doors and Windows

door (5,4)|(5,5), door (4,2)|(4,3), door (1,2)|(2,2), window (5,1) bottom, window (5,1) left, window (1,4) top

### Solution Grid

```text
. . . . A
. . B . .
C . . . .
. . . D .
. E . . .
```

### Clues

- Ben: Was confirmed in the Ballroom all evening.
- Dylan: Was nowhere near any windows.
- Eve: Was confirmed in the Wine Cellar all evening.
- Amy: Was seen near the outer walls of the manor.

### Clue Type Counts

edge: 1, near-window: 2, room: 2

### Deduction Trace

```text
solvable: true
order: Cole -> Ben -> Dylan -> Amy -> Eve
murderer last in order: no
```

## easy-3

- ID: easy-3
- Difficulty: easy
- N: 5
- roomLabelsClash: true
- Starter: Cole (3,2)
- Crime scene: (3,1)
- Murderer: Eve

### Room Map

```text
A A A A B
A C C B B
E C D D D
E E D D D
E E D D D

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar
```

### Doors and Windows

door (3,2)|(4,2), door (2,3)|(3,3), door (1,3)|(2,3), window (1,5) top, window (1,5) right, window (5,3) bottom

### Solution Grid

```text
. . A . .
. . . . B
. C . . .
. . . D .
E . . . .
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Ben: Was nowhere near any windows.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was spotted in a corner of the manor.

### Clue Type Counts

corner: 1, near-window: 2, room: 2

### Deduction Trace

```text
solvable: true
order: Cole -> Ben -> Amy -> Dylan -> Eve
murderer last in order: yes
```

## easy-4

- ID: easy-4
- Difficulty: easy
- N: 5
- roomLabelsClash: true
- Starter: Eve (5,2)
- Crime scene: (1,1)
- Murderer: Amy

### Room Map

```text
A A A A A
C C A A B
C C D D D
C E E D D
C E E D D

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar
```

### Doors and Windows

door (1,1)|(2,1), door (2,5)|(3,5), door (2,2)|(2,3), window (5,4) bottom, window (5,1) left, window (5,1) bottom

### Solution Grid

```text
. . A . .
. . . . B
C . . . .
. . . D .
. E . . .
```

### Clues

- Ben: Was seen lingering near a doorway.
- Cole: Was confirmed in the Kitchen all evening.
- Dylan: Was nowhere near any windows.
- Amy: Was seen near the outer walls of the manor.

### Clue Type Counts

edge: 1, near-door: 1, near-window: 2, room: 1

### Deduction Trace

```text
solvable: true
order: Eve -> Cole -> Ben -> Amy -> Dylan
murderer last in order: no
```

## easy-5

- ID: easy-5
- Difficulty: easy
- N: 5
- roomLabelsClash: true
- Starter: Dylan (4,2)
- Crime scene: (3,5)
- Murderer: Eve

### Room Map

```text
B B A A C
B B B C C
D D B C E
D D D D E
D D E E E

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar
```

### Doors and Windows

door (3,4)|(4,4), door (4,4)|(5,4), door (2,1)|(3,1), window (5,5) bottom, window (1,5) right, window (5,3) bottom

### Solution Grid

```text
. . A . .
B . . . .
. . . C .
. D . . .
. . . . E
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Ben: Was seen near the outer walls of the manor.
- Cole: Was seen lingering near a doorway.
- Eve: Was spotted in a corner of the manor.

### Clue Type Counts

corner: 1, edge: 1, near-door: 1, near-window: 1, room: 1

### Deduction Trace

```text
solvable: true
order: Dylan -> Cole -> Ben -> Eve -> Amy
murderer last in order: no
```

## easy-6

- ID: easy-6
- Difficulty: easy
- N: 5
- roomLabelsClash: true
- Starter: Ben (2,3)
- Crime scene: (1,2)
- Murderer: Amy

### Room Map

```text
A A A B C
A B B B C
A D D C C
D D D C E
D D E E E

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar
```

### Doors and Windows

door (2,3)|(3,3), door (2,4)|(3,4), door (4,3)|(5,3), window (5,5) right, window (2,5) right, window (5,1) bottom

### Solution Grid

```text
A . . . .
. . B . .
. . . . C
. D . . .
. . . E .
```

### Clues

- Cole: Was seen near the outer walls of the manor.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was confirmed in the Wine Cellar all evening.
- Amy: Was spotted in a corner of the manor.

### Clue Type Counts

corner: 1, edge: 1, near-window: 1, room: 2

### Deduction Trace

```text
solvable: true
order: Ben -> Eve -> Dylan -> Cole -> Amy
murderer last in order: yes
```

## easy-7

- ID: easy-7
- Difficulty: easy
- N: 5
- roomLabelsClash: true
- Starter: Amy (1,3)
- Crime scene: (2,2)
- Murderer: Cole

### Room Map

```text
A A A A B
A C C C B
E C D D D
E E D D D
E E E D D

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar
```

### Doors and Windows

door (4,2)|(4,3), door (3,1)|(3,2), door (2,4)|(3,4), window (4,5) right, window (1,5) right, window (4,1) left

### Solution Grid

```text
. . A . .
. . . . B
. C . . .
. . . D .
E . . . .
```

### Clues

- Ben: Was confirmed in the Ballroom all evening.
- Dylan: Was nowhere near any windows.
- Eve: Was seen near the outer walls of the manor.
- Cole: Was seen lingering near a doorway.

### Clue Type Counts

edge: 1, near-door: 1, near-window: 2, room: 1

### Deduction Trace

```text
solvable: true
order: Amy -> Ben -> Dylan -> Cole -> Eve
murderer last in order: no
```

## easy-8

- ID: easy-8
- Difficulty: easy
- N: 5
- roomLabelsClash: true
- Starter: Cole (3,3)
- Crime scene: (1,5)
- Murderer: Dylan

### Room Map

```text
B A A A D
B B C A D
B C C C D
B B C D D
B E C D D

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar
```

### Doors and Windows

door (2,4)|(3,4), door (5,1)|(5,2), door (1,3)|(2,3), window (5,5) bottom, window (5,2) bottom, window (3,5) right

### Solution Grid

```text
. . . A .
B . . . .
. . C . .
. . . . D
. E . . .
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Ben: Was confirmed in the Ballroom all evening.
- Eve: Was seen lingering near a doorway.
- Dylan: Was nowhere near any windows.

### Clue Type Counts

near-door: 1, near-window: 2, room: 2

### Deduction Trace

```text
solvable: true
order: Cole -> Eve -> Amy -> Ben -> Dylan
murderer last in order: yes
```

## hard-1

- ID: hard-1
- Difficulty: hard
- N: 9
- roomLabelsClash: true
- Starter: Eve (5,1)
- Crime scene: (7,1)
- Murderer: Iris

### Room Map

```text
E B B B B B B C A
E E E E B D D C C
E E F F D D D C C
E E F F D D D D C
E G F F D F D D C
E G F F F F H H C
I G F F F H H H H
I I I I I I H H H
I I I I I I H H H

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory, H = Billiard Room, I = Gallery
```

### Doors and Windows

door (6,2)|(6,3), door (3,7)|(3,8), door (2,4)|(2,5), door (7,6)|(8,6), door (7,5)|(8,5), door (5,5)|(5,6), window (1,8) top, window (4,9) right, window (9,6) bottom, window (1,4) top, window (9,5) bottom, window (9,9) right

### Solution Grid

```text
. . . . . . . . A
. . . . B . . . .
. . . . . . . C .
. . . . . D . . .
E . . . . . . . .
. . . F . . . . .
. G . . . . . . .
. . . . . . H . .
. . I . . . . . .
```

### Clues

- Amy: Was spotted in a corner of the manor.
- Ben: Was nowhere near any windows.
- Cole: Was confirmed in the Kitchen all evening.
- Dylan: Was confirmed in the Study all evening.
- Finn: Was confirmed in the Trophy Room all evening.
- Greta: Was confirmed in the Conservatory all evening.
- Hugo: Was confirmed in the Billiard Room all evening.
- Iris: Was seen near the outer walls of the manor.

### Clue Type Counts

corner: 1, edge: 1, near-window: 1, room: 6

### Deduction Trace

```text
solvable: true
order: Eve -> Greta -> Amy -> Cole -> Ben -> Dylan -> Finn -> Iris -> Hugo
murderer last in order: no
```

## hard-2

- ID: hard-2
- Difficulty: hard
- N: 9
- roomLabelsClash: true
- Starter: Greta (7,8)
- Crime scene: (1,8)
- Murderer: Amy

### Room Map

```text
C C C B B B B A A
C C C B D D D D D
C E C C D D D D D
E E E E F F D D D
E E F E F F G G G
E F F F F G G G G
E I I I I H H G H
E I H H H H H H H
E I I H H H H H H

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory, H = Billiard Room, I = Gallery
```

### Doors and Windows

door (4,3)|(5,3), door (2,2)|(3,2), door (1,9)|(2,9), door (6,5)|(7,5), door (5,4)|(5,5), door (7,8)|(7,9), window (1,5) top, window (3,9) right, window (8,1) left, window (1,6) top, window (5,9) right, window (1,4) top

### Solution Grid

```text
. . . . . . . . A
. . . B . . . . .
C . . . . . . . .
. . . . . . D . .
. E . . . . . . .
. . . . F . . . .
. . . . . . . G .
. . . . . H . . .
. . I . . . . . .
```

### Clues

- Ben: Was confirmed in the Ballroom all evening.
- Cole: Was confirmed in the Kitchen all evening.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was nowhere near any windows.
- Finn: Was confirmed in the Trophy Room all evening.
- Hugo: Was confirmed in the Billiard Room all evening.
- Iris: Was confirmed in the Gallery all evening.
- Amy: Was seen near the outer walls of the manor.

### Clue Type Counts

edge: 1, near-window: 1, room: 7

### Deduction Trace

```text
solvable: true
order: Greta -> Ben -> Cole -> Dylan -> Eve -> Finn -> Hugo -> Amy -> Iris
murderer last in order: no
```

## hard-3

- ID: hard-3
- Difficulty: hard
- N: 9
- roomLabelsClash: true
- Starter: Finn (6,2)
- Crime scene: (7,6)
- Murderer: Iris

### Room Map

```text
B B B B B B B C A
B F D B D B B C C
F F D D D D D C C
F F F G D D E E C
F F F G E E E E E
H F F G G G G G E
H H G G G I G G E
H H I I I I I I E
I I I I I I I I E

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory, H = Billiard Room, I = Gallery
```

### Doors and Windows

door (6,1)|(6,2), door (1,5)|(2,5), door (2,5)|(2,6), door (2,1)|(3,1), door (8,1)|(9,1), door (2,7)|(2,8), window (6,1) left, window (3,1) left, window (1,8) top, window (9,7) bottom, window (8,1) left, window (2,9) right

### Solution Grid

```text
. . . . . . . . A
. . . . . B . . .
. . . . . . . C .
. . . . D . . . .
. . . . . . E . .
. F . . . . . . .
. . . G . . . . .
H . . . . . . . .
. . I . . . . . .
```

### Clues

- Amy: Was spotted in a corner of the manor.
- Ben: Was seen lingering near a doorway.
- Cole: Was nowhere near any windows.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was confirmed in the Wine Cellar all evening.
- Greta: Was confirmed in the Conservatory all evening.
- Hugo: Was spotted near a window.
- Iris: Was seen near the outer walls of the manor.

### Clue Type Counts

corner: 1, edge: 1, near-door: 1, near-window: 3, room: 3

### Deduction Trace

```text
solvable: true
order: Finn -> Amy -> Cole -> Ben -> Dylan -> Eve -> Greta -> Hugo -> Iris
murderer last in order: yes
```

## hard-4

- ID: hard-4
- Difficulty: hard
- N: 9
- roomLabelsClash: true
- Starter: Cole (3,8)
- Crime scene: (6,1)
- Murderer: Hugo

### Room Map

```text
E B B B B B A A C
E E E E B B C C C
E E E F B D D C D
E E E F D D D D D
E F F F F F D D G
H F F F F F G G G
H H H H I I G G G
H H H H H I G G G
H H H I I I I G G

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory, H = Billiard Room, I = Gallery
```

### Doors and Windows

door (4,6)|(5,6), door (1,3)|(2,3), door (7,4)|(7,5), door (1,6)|(1,7), door (2,4)|(2,5), door (3,7)|(3,8), window (5,1) left, window (1,4) top, window (1,8) top, window (1,9) top, window (9,9) bottom, window (6,9) right

### Solution Grid

```text
. . . . . . A . .
. . . . B . . . .
. . . . . . . C .
. . . . . D . . .
E . . . . . . . .
. . F . . . . . .
. . . . . . . . G
. H . . . . . . .
. . . I . . . . .
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Ben: Was nowhere near any windows.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was confirmed in the Wine Cellar all evening.
- Finn: Was confirmed in the Trophy Room all evening.
- Greta: Was confirmed in the Conservatory all evening.
- Iris: Was confirmed in the Gallery all evening.
- Hugo: Was far from any doorways.

### Clue Type Counts

near-door: 1, near-window: 2, room: 6

### Deduction Trace

```text
solvable: true
order: Cole -> Amy -> Ben -> Dylan -> Eve -> Finn -> Iris -> Hugo -> Greta
murderer last in order: no
```

## hard-5

- ID: hard-5
- Difficulty: hard
- N: 9
- roomLabelsClash: false
- Starter: Ben (2,6)
- Crime scene: (6,2)
- Murderer: Iris

### Room Map

```text
C C B B B B B A D
C C C E B B B B D
C F E E E D D D D
F F F E E D G D D
F F F F E D G D G
F I F F F G G G G
I I H H F G G G G
I H H H F H G G G
I I I H H H H G G

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory, H = Billiard Room, I = Gallery
```

### Doors and Windows

door (8,5)|(9,5), door (1,8)|(1,9), door (9,7)|(9,8), door (8,7)|(9,7), door (4,5)|(4,6), door (6,2)|(6,3), window (1,3) top, window (9,1) bottom, window (9,2) bottom, window (9,8) bottom, window (9,9) bottom, window (4,1) left

### Solution Grid

```text
. . . . . . . A .
. . . . . B . . .
C . . . . . . . .
. . . . . . . . D
. . . . E . . . .
. . F . . . . . .
. . . . . . G . .
. . . H . . . . .
. I . . . . . . .
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Cole: Was seen near the outer walls of the manor.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was nowhere near any windows.
- Finn: Was confirmed in the Trophy Room all evening.
- Greta: Was confirmed in the Conservatory all evening.
- Hugo: Was confirmed in the Billiard Room all evening.
- Iris: Was spotted near a window.

### Clue Type Counts

edge: 1, near-window: 2, room: 6

### Deduction Trace

```text
solvable: true
order: Ben -> Amy -> Eve -> Finn -> Hugo -> Cole -> Dylan -> Iris -> Greta
murderer last in order: no
```

## hard-6

- ID: hard-6
- Difficulty: hard
- N: 9
- roomLabelsClash: true
- Starter: Dylan (4,3)
- Crime scene: (7,7)
- Murderer: Iris

### Room Map

```text
C A A A A A A A B
C A A A A A E B B
C C A A D E E E B
C D D D D E E B B
C C D E E E E G G
C D D H E G G G F
C C H H E G I G G
H C C H H H I G I
H H H H H H I I I

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory, H = Billiard Room, I = Gallery
```

### Doors and Windows

door (7,6)|(7,7), door (4,9)|(5,9), door (4,4)|(5,4), door (3,4)|(4,4), door (4,2)|(5,2), door (7,9)|(8,9), window (9,1) left, window (9,4) bottom, window (3,9) right, window (7,1) left, window (1,9) top, window (5,9) right

### Solution Grid

```text
. A . . . . . . .
. . . . . . . B .
C . . . . . . . .
. . D . . . . . .
. . . . E . . . .
. . . . . . . . F
. . . . . G . . .
. . . H . . . . .
. . . . . . I . .
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Ben: Was confirmed in the Ballroom all evening.
- Cole: Was confirmed in the Kitchen all evening.
- Eve: Was nowhere near any windows.
- Finn: Was confirmed in the Trophy Room all evening.
- Greta: Was confirmed in the Conservatory all evening.
- Hugo: Was confirmed in the Billiard Room all evening.
- Iris: Was seen near the outer walls of the manor.

### Clue Type Counts

edge: 1, near-window: 2, room: 6

### Deduction Trace

```text
solvable: true
order: Dylan -> Finn -> Ben -> Greta -> Eve -> Hugo -> Iris -> Amy -> Cole
murderer last in order: no
```

## hard-7

- ID: hard-7
- Difficulty: hard
- N: 9
- roomLabelsClash: true
- Starter: Iris (9,4)
- Crime scene: (3,9)
- Murderer: Greta

### Room Map

```text
D A C C C B B B B
D D D D C C C C B
D D D C C E C E G
D F D F F E C E G
D F F F F E E E G
D D F H H H E E G
F F F I I H H G G
I I I I I H H H G
I I I I I I I H G

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory, H = Billiard Room, I = Gallery
```

### Doors and Windows

door (5,4)|(6,4), door (9,8)|(9,9), door (7,5)|(7,6), door (4,2)|(4,3), door (6,2)|(6,3), door (8,8)|(8,9), window (1,4) top, window (1,5) top, window (3,9) right, window (9,8) bottom, window (9,1) left, window (5,1) left

### Solution Grid

```text
. A . . . . . . .
. . . . . . . . B
. . . . C . . . .
D . . . . . . . .
. . . . . . E . .
. . F . . . . . .
. . . . . . . G .
. . . . . H . . .
. . . I . . . . .
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Ben: Was confirmed in the Ballroom all evening.
- Cole: Was confirmed in the Kitchen all evening.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was confirmed in the Wine Cellar all evening.
- Finn: Was nowhere near any windows.
- Hugo: Was confirmed in the Billiard Room all evening.
- Greta: Was far from any doorways.

### Clue Type Counts

near-door: 1, near-window: 2, room: 6

### Deduction Trace

```text
solvable: true
order: Iris -> Amy -> Ben -> Cole -> Eve -> Hugo -> Finn -> Greta -> Dylan
murderer last in order: no
```

## hard-8

- ID: hard-8
- Difficulty: hard
- N: 9
- roomLabelsClash: true
- Starter: Eve (5,3)
- Crime scene: none
- Murderer: Amy

### Room Map

```text
A C C B B B B B B
C C C C F F B D D
C C E E F F D D D
C C E E F F F D H
E E E F F D D D H
E G G G F F H H H
G G I G G G G H H
G I I I I I I I H
G I I I I I I H H

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory, H = Billiard Room, I = Gallery
```

### Doors and Windows

door (5,3)|(5,4), door (5,8)|(6,8), door (4,4)|(5,4), door (3,9)|(4,9), door (7,3)|(7,4), door (4,4)|(4,5), window (9,9) right, window (1,5) top, window (9,6) bottom, window (7,9) right, window (9,2) bottom, window (9,9) bottom

### Solution Grid

```text
A . . . . . . . .
. . . . . . B . .
. C . . . . . . .
. . . . . . . D .
. . E . . . . . .
. . . . . F . . .
. . . G . . . . .
. . . . . . . . H
. . . . I . . . .
```

### Clues

- Ben: Was nowhere near any windows.
- Cole: Was confirmed in the Kitchen all evening.
- Dylan: Was confirmed in the Study all evening.
- Finn: Was confirmed in the Trophy Room all evening.
- Greta: Was seen lingering near a doorway.
- Hugo: Was confirmed in the Billiard Room all evening.
- Iris: Was seen near the outer walls of the manor.
- Amy: Was spotted in a corner of the manor.

### Clue Type Counts

corner: 1, edge: 1, near-door: 2, near-window: 1, room: 4

### Deduction Trace

```text
solvable: true
order: Eve -> Ben -> Greta -> Cole -> Dylan -> Finn -> Iris -> Amy -> Hugo
murderer last in order: no
```

## medium-1

- ID: medium-1
- Difficulty: medium
- N: 7
- roomLabelsClash: true
- Starter: Ben (2,4)
- Crime scene: (4,3)
- Murderer: Finn

### Room Map

```text
C A A B B B E
C C B B D D E
C C C D D E E
C C F D D E E
F F F E E E E
F F F F E G G
F F F G G G G

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory
```

### Doors and Windows

door (2,6)|(3,6), door (2,2)|(2,3), door (5,7)|(6,7), door (7,3)|(7,4), window (5,1) left, window (7,1) left, window (7,7) right, window (1,6) top

### Solution Grid

```text
. A . . . . .
. . . B . . .
C . . . . . .
. . . . D . .
. . . . . . E
. . F . . . .
. . . . . G .
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Cole: Was confirmed in the Kitchen all evening.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was confirmed in the Wine Cellar all evening.
- Greta: Was seen near the outer walls of the manor.
- Finn: Was nowhere near any windows.

### Clue Type Counts

edge: 1, near-window: 2, room: 4

### Deduction Trace

```text
solvable: true
order: Ben -> Amy -> Dylan -> Cole -> Eve -> Finn -> Greta
murderer last in order: no
```

## medium-2

- ID: medium-2
- Difficulty: medium
- N: 7
- roomLabelsClash: true
- Starter: Greta (7,2)
- Crime scene: (2,1)
- Murderer: Eve

### Room Map

```text
B B B B B C A
E D D B B C C
E E D D C C C
E E D D F C C
E E E D F F F
E E E G F F F
E G G G F F F

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory
```

### Doors and Windows

door (6,4)|(6,5), door (2,2)|(3,2), door (1,3)|(2,3), door (1,7)|(2,7), window (1,3) top, window (1,7) top, window (6,7) right, window (2,7) right

### Solution Grid

```text
. . . . . . A
. . . B . . .
. . . . . C .
. . D . . . .
E . . . . . .
. . . . F . .
. G . . . . .
```

### Clues

- Amy: Was spotted in a corner of the manor.
- Ben: Was confirmed in the Ballroom all evening.
- Cole: Was confirmed in the Kitchen all evening.
- Dylan: Was confirmed in the Study all evening.
- Finn: Was seen lingering near a doorway.
- Eve: Was seen near the outer walls of the manor.

### Clue Type Counts

corner: 1, edge: 1, near-door: 1, near-window: 1, room: 3

### Deduction Trace

```text
solvable: true
order: Greta -> Finn -> Amy -> Ben -> Dylan -> Cole -> Eve
murderer last in order: yes
```

## medium-3

- ID: medium-3
- Difficulty: medium
- N: 7
- roomLabelsClash: true
- Starter: Dylan (4,6)
- Crime scene: (1,1)
- Murderer: Cole

### Room Map

```text
C C A B B B B
C C C B B D D
C C C C D D D
C E E D D D F
C E G G G D F
G G G G F F F
G G G G G G G

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory
```

### Doors and Windows

door (1,7)|(2,7), door (6,6)|(7,6), door (5,6)|(6,6), door (3,3)|(4,3), window (4,7) right, window (1,7) right, window (1,3) top, window (1,4) top

### Solution Grid

```text
. . A . . . .
. . . . B . .
C . . . . . .
. . . . . D .
. E . . . . .
. . . . . . F
. . . G . . .
```

### Clues

- Amy: Was spotted near a window.
- Ben: Was confirmed in the Ballroom all evening.
- Eve: Was nowhere near any windows.
- Finn: Was confirmed in the Trophy Room all evening.
- Greta: Was confirmed in the Conservatory all evening.
- Cole: Was seen near the outer walls of the manor.

### Clue Type Counts

edge: 1, near-window: 3, room: 3

### Deduction Trace

```text
solvable: true
order: Dylan -> Eve -> Ben -> Amy -> Finn -> Cole -> Greta
murderer last in order: no
```

## medium-4

- ID: medium-4
- Difficulty: medium
- N: 7
- roomLabelsClash: false
- Starter: Amy (1,5)
- Crime scene: (1,1)
- Murderer: Dylan

### Room Map

```text
D A A A A A A
D D C A A A B
D C C C E E E
D D D E E E E
F F F E G G G
G F F F G G G
G G G G G G G

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory
```

### Doors and Windows

door (5,3)|(5,4), door (3,4)|(3,5), door (5,4)|(5,5), door (3,2)|(4,2), window (1,3) top, window (4,7) right, window (6,1) left, window (7,7) bottom

### Solution Grid

```text
. . . . A . .
. . . . . . B
. . C . . . .
D . . . . . .
. . . E . . .
. F . . . . .
. . . . . G .
```

### Clues

- Ben: Was confirmed in the Ballroom all evening.
- Cole: Was confirmed in the Kitchen all evening.
- Eve: Was seen lingering near a doorway.
- Finn: Was confirmed in the Trophy Room all evening.
- Greta: Was confirmed in the Conservatory all evening.
- Dylan: Was seen near the outer walls of the manor.

### Clue Type Counts

edge: 1, near-door: 1, near-window: 1, room: 4

### Deduction Trace

```text
solvable: true
order: Amy -> Ben -> Eve -> Finn -> Cole -> Greta -> Dylan
murderer last in order: yes
```

## medium-5

- ID: medium-5
- Difficulty: medium
- N: 7
- roomLabelsClash: true
- Starter: Greta (7,7)
- Crime scene: (2,6)
- Murderer: Cole

### Room Map

```text
A A A A A A A
B B B A A C C
B B B A C C G
B D C C C E G
B B F F F E G
B F F G F E G
B F F G G G G

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory
```

### Doors and Windows

door (5,2)|(5,3), door (6,1)|(6,2), door (3,6)|(4,6), door (7,1)|(7,2), window (1,2) top, window (2,7) right, window (1,7) top, window (1,1) left

### Solution Grid

```text
. . . A . . .
B . . . . . .
. . . . C . .
. D . . . . .
. . . . . E .
. . F . . . .
. . . . . . G
```

### Clues

- Amy: Was seen near the outer walls of the manor.
- Ben: Was confirmed in the Ballroom all evening.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was confirmed in the Wine Cellar all evening.
- Finn: Was confirmed in the Trophy Room all evening.
- Cole: Was nowhere near any windows.

### Clue Type Counts

edge: 1, near-window: 2, room: 4

### Deduction Trace

```text
solvable: true
order: Greta -> Dylan -> Eve -> Finn -> Ben -> Cole -> Amy
murderer last in order: no
```

## medium-6

- ID: medium-6
- Difficulty: medium
- N: 7
- roomLabelsClash: true
- Starter: Cole (3,5)
- Crime scene: (1,1)
- Murderer: Dylan

### Room Map

```text
D D B A B B B
D D B B B C B
G D C C C C C
G D D C C E E
G D D F E E E
G G F F E E E
G G G G G G E

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory
```

### Doors and Windows

door (2,4)|(3,4), door (2,7)|(3,7), door (3,2)|(3,3), door (4,5)|(5,5), window (1,1) top, window (3,7) right, window (1,7) top, window (7,4) bottom

### Solution Grid

```text
. . . A . . .
. . . . . . B
. . . . C . .
. D . . . . .
. . . . . E .
. . F . . . .
G . . . . . .
```

### Clues

- Amy: Was confirmed in the Library all evening.
- Ben: Was confirmed in the Ballroom all evening.
- Eve: Was confirmed in the Wine Cellar all evening.
- Finn: Was confirmed in the Trophy Room all evening.
- Greta: Was seen near the outer walls of the manor.
- Dylan: Was nowhere near any windows.

### Clue Type Counts

edge: 1, near-window: 2, room: 4

### Deduction Trace

```text
solvable: true
order: Cole -> Amy -> Ben -> Finn -> Eve -> Dylan -> Greta
murderer last in order: no
```

## medium-7

- ID: medium-7
- Difficulty: medium
- N: 7
- roomLabelsClash: true
- Starter: Finn (6,4)
- Crime scene: (4,1)
- Murderer: Eve

### Room Map

```text
A B B B B B B
C C C C B B D
C C C C C D D
E E E F C G D
E E E F F G G
E F F F F F G
E E F F F G G

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory
```

### Doors and Windows

door (2,5)|(3,5), door (3,6)|(4,6), door (4,4)|(4,5), door (5,2)|(6,2), window (7,5) bottom, window (1,2) top, window (1,5) top, window (4,7) right

### Solution Grid

```text
A . . . . . .
. . . . B . .
. . C . . . .
. . . . . . D
. E . . . . .
. . . F . . .
. . . . . G .
```

### Clues

- Amy: Was spotted in a corner of the manor.
- Ben: Was confirmed in the Ballroom all evening.
- Cole: Was confirmed in the Kitchen all evening.
- Dylan: Was spotted near a window.
- Greta: Was nowhere near any windows.
- Eve: Was seen lingering near a doorway.

### Clue Type Counts

corner: 1, near-door: 1, near-window: 3, room: 2

### Deduction Trace

```text
solvable: true
order: Finn -> Dylan -> Amy -> Greta -> Cole -> Eve -> Ben
murderer last in order: no
```

## medium-8

- ID: medium-8
- Difficulty: medium
- N: 7
- roomLabelsClash: false
- Starter: Amy (1,7)
- Crime scene: (1,1)
- Murderer: Ben

### Room Map

```text
B B B B A A A
B D B A A C E
B D D A C C E
B B D D D E E
G G G F D E F
G G G F F F F
G G G G G F F

Legend: A = Library, B = Ballroom, C = Kitchen, D = Study, E = Wine Cellar, F = Trophy Room, G = Conservatory
```

### Doors and Windows

door (6,3)|(6,4), door (5,5)|(5,6), door (2,5)|(3,5), door (3,3)|(3,4), window (7,7) bottom, window (7,4) bottom, window (7,7) right, window (4,1) left

### Solution Grid

```text
. . . . . . A
B . . . . . .
. . . . C . .
. . D . . . .
. . . . . E .
. . . F . . .
. G . . . . .
```

### Clues

- Cole: Was seen lingering near a doorway.
- Dylan: Was confirmed in the Study all evening.
- Eve: Was confirmed in the Wine Cellar all evening.
- Finn: Was confirmed in the Trophy Room all evening.
- Greta: Was confirmed in the Conservatory all evening.
- Ben: Was seen near the outer walls of the manor.

### Clue Type Counts

edge: 1, near-door: 1, near-window: 1, room: 4

### Deduction Trace

```text
solvable: true
order: Amy -> Cole -> Eve -> Finn -> Dylan -> Ben -> Greta
murderer last in order: no
```
