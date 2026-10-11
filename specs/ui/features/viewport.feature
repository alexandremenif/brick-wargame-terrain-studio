@ui
Feature: Interactive Canvas Viewport

  Background:
    Given the UI is loaded with an active asset of 32 by 32 studs

  Scenario: Canvas viewport displays the active bounding box subregion
    When the active bounding box is set to X 4, Y 4, Width 16, Height 12
    Then the canvas viewport should frame exactly the 16 by 12 subregion from (4, 4) to (19, 15)
    And the studs should be scaled to best fit the viewport with no scrollbars
    And there should be no pink bounding box overlay on the canvas

  Scenario: Painting a stud via click in the canvas viewport
    Given I select the brick color swatch "Bright Green"
    When I click on the stud at coordinate (10, 10) in the viewport
    Then the stud at coordinate (10, 10) should be rendered with color "Bright Green"
    And exactly 1 stud should be painted

  Scenario: Painting with 2x2 brush size via click
    Given I select brush size "2x2"
    And I select the brick color swatch "Bright Blue"
    When I click on the stud at coordinate (4, 4) in the viewport
    Then exactly 4 studs should be painted
    And the studs in bounding box (4, 4, 2, 2) should have color "Bright Blue"

  Scenario: Clearing studs via Eraser tool on click
    Given the stud at coordinate (10, 10) is painted with color "Bright Green"
    When I click the "Eraser" tool button
    And I click on the stud at coordinate (10, 10) in the viewport
    Then the stud at coordinate (10, 10) should be unpainted

  Scenario: Dragging in the canvas viewport using Pan mode moves the bounding box
    Given I click the "Pan" tool button
    And the bounding box is currently at X 10, Y 10, Width 8, Height 8
    When I drag the mouse across the canvas viewport by an offset corresponding to 3 studs horizontally and 2 studs vertically
    Then the inspector inputs should reflect X 7, Y 8, Width 8, Height 8
    And the canvas viewport should frame the subregion (7, 8, 8, 8)

  Scenario: Zooming in via mouse wheel reduces bounding box centered on current center
    Given the bounding box is currently at X 4, Y 4, Width 16, Height 16
    When I scroll the mouse wheel up over the canvas viewport
    Then the bounding box width and height should decrease by approximately 25 percent
    And the center of the bounding box should remain approximately at (12, 12)

  Scenario: Zooming out via mouse wheel enlarges bounding box centered on current center
    Given the bounding box is currently at X 8, Y 8, Width 8, Height 8
    When I scroll the mouse wheel down over the canvas viewport
    Then the bounding box width and height should increase by approximately 25 percent
    And the center of the bounding box should remain approximately at (12, 12)
