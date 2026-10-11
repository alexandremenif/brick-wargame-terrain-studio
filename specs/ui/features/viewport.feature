@ui
Feature: Interactive SVG Viewport

  Background:
    Given the UI is loaded with an active asset of 32 by 32 studs

  Scenario: Painting studs via click in the SVG viewport
    Given I select the LEGO color swatch "Bright Green"
    When I click on the stud at coordinate (10, 10) in the viewport
    Then the stud at coordinate (10, 10) should be rendered with color "Bright Green"
    And exactly 1 stud should be painted

  Scenario: Painting with 2x2 brush size
    Given I select brush size "2x2"
    And I select the LEGO color swatch "Bright Blue"
    When I click on the stud at coordinate (4, 4) in the viewport
    Then exactly 4 studs should be painted
    And the studs in bounding box (4, 4, 2, 2) should have color "Bright Blue"

  Scenario: Clearing studs via Eraser tool
    Given the stud at coordinate (10, 10) is painted with color "Bright Green"
    When I click the "Eraser" tool button
    And I click on the stud at coordinate (10, 10) in the viewport
    Then the stud at coordinate (10, 10) should be unpainted

  Scenario: Displaying the active bounding box overlay
    When the active bounding box is set to (4, 4, 16, 12)
    Then the SVG viewport should display a highlighted bounding box overlay at (4, 4, 16, 12)
