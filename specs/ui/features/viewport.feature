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
