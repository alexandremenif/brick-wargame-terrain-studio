Feature: Pure Domain 2D Canvas Asset Grid Rendering

  Scenario: Render asset with painted cells and checkerboard transparency
    Given an asset "Checkerboard Test" with dimensions 2 by 2
    And official brick color 17 is "Earth Green" with hex "#184632"
    And the asset has painted cells:
      | x | y | colorId |
      | 0 | 0 | 17      |
    When I render the asset with 8 pixels per stud and background mode "checkerboard"
    Then the canvas pixel dimensions should be 16 by 16
    And the stud at stud coordinate (0, 0) should be solid color "#184632"
    And the stud at stud coordinate (1, 1) should have a 2 by 2 checkerboard pattern of "#27272a" and "#18181b"

  Scenario: Render completely unpainted asset in checkerboard mode
    Given an asset "Blank Canvas" with dimensions 2 by 2
    When I render the asset with 4 pixels per stud and background mode "checkerboard"
    Then all studs should display the 2 by 2 checkerboard pattern of "#27272a" and "#18181b"
    And no stud should contain solid color

  Scenario: Render asset in white background mode for printing
    Given an asset "Print Background Test" with dimensions 2 by 2
    And official brick color 5 is "Bright Red" with hex "#C91A09"
    And the asset has painted cells:
      | x | y | colorId |
      | 0 | 0 | 5       |
    When I render the asset with 8 pixels per stud and background mode "white"
    Then the canvas pixel dimensions should be 16 by 16
    And the stud at stud coordinate (0, 0) should be solid color "#C91A09"
    And the stud at stud coordinate (1, 1) should be solid color "#FFFFFF"

  Scenario: Render completely saturated asset with all studs painted
    Given an asset "Saturated Mat" with dimensions 2 by 2
    And official brick color 17 is "Earth Green" with hex "#184632"
    And the asset has painted cells:
      | x | y | colorId |
      | 0 | 0 | 17      |
      | 1 | 0 | 17      |
      | 0 | 1 | 17      |
      | 1 | 1 | 17      |
    When I render the asset with 8 pixels per stud and background mode "checkerboard"
    Then the canvas pixel dimensions should be 16 by 16
    And all studs should be solid color "#184632"

  Scenario: Render framed bounding box sub-region ignoring surrounding asset cells
    Given an asset "BBox Crop Test" with dimensions 10 by 10
    And official brick color 12 is "Bright Yellow" with hex "#F2CD37"
    And official brick color 17 is "Earth Green" with hex "#184632"
    And the asset has painted cells:
      | x | y | colorId |
      | 5 | 5 | 12      |
      | 0 | 0 | 17      |
      | 8 | 8 | 17      |
    When I render the bounding box (4, 4, 2, 2) with 8 pixels per stud and background mode "white"
    Then the canvas pixel dimensions should be 16 by 16
    And the stud at local position (1, 1) should be solid color "#F2CD37"
    And the stud at local position (0, 0) should be solid color "#FFFFFF"

  Scenario: Strict boundary threshold for grid line suppression (3px vs 4px)
    Given an asset "Threshold Grid Test" with dimensions 4 by 4
    When I render the asset with 3 pixels per stud with grid overlay enabled
    Then the canvas should suppress grid line strokes to prevent visual noise
    When I render the asset with 4 pixels per stud with grid overlay enabled
    Then the canvas should contain grid line strokes of color "rgba(0, 0, 0, 0.15)"

  Scenario: Grid lines are omitted when grid overlay is disabled at large stud size
    Given an asset "No Grid Test" with dimensions 4 by 4
    When I render the asset with 8 pixels per stud with grid overlay disabled
    Then the canvas should suppress grid line strokes to prevent visual noise

  Scenario: Reject pixels per stud below minimum threshold
    Given an asset "Threshold Error Test" with dimensions 2 by 2
    When I attempt to render the asset with 1 pixels per stud
    Then rendering should fail with an error indicating minimum stud size is 2 pixels
