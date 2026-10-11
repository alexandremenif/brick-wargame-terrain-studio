@ui
Feature: Right Inspector Sidebar & Minimap

  Background:
    Given the UI is loaded with an active asset of 32 by 32 studs

  Scenario: Valid bounding box parameters update the viewport and minimap indicator
    When I enter bounding box coordinates X 4, Y 6, Width 10, Height 8
    Then the inspector inputs should reflect X 4, Y 6, Width 10, Height 8
    And the canvas viewport should frame the subregion (4, 6, 10, 8)
    And the minimap should display the bounding box indicator at position (4, 6, 10, 8) on the 32 by 32 asset

  Scenario: Rejecting invalid bounding box coordinates
    Given the bounding box is currently at X 4, Y 6, Width 10, Height 8
    When I enter bounding box coordinate X 30
    Then the input should be rejected and revert to X 4
    And the canvas viewport framing should remain at (4, 6, 10, 8)

  Scenario: Rejecting non-positive bounding box dimensions
    Given the bounding box is currently at X 4, Y 6, Width 10, Height 8
    When I enter bounding box Width 0
    Then the input should be rejected and revert to Width 10
    And the canvas viewport framing should remain at (4, 6, 10, 8)

  Scenario: Framing the entire asset via Fit to Asset action
    Given the bounding box is currently at X 4, Y 6, Width 10, Height 8
    When I click the "Fit to Asset" button in the inspector
    Then the inspector inputs should reflect X 0, Y 0, Width 32, Height 32
    And the canvas viewport should frame the full asset (0, 0, 32, 32)
    And the minimap bounding box indicator should cover the entire 32 by 32 asset

  Scenario: Zooming in via Zoom In button
    Given the bounding box is currently at X 4, Y 4, Width 16, Height 16
    When I click the "Zoom In" button in the inspector
    Then the bounding box width and height should decrease by approximately 25 percent
    And the center of the bounding box should remain approximately at (12, 12)

  Scenario: Zooming out via Zoom Out button
    Given the bounding box is currently at X 8, Y 8, Width 8, Height 8
    When I click the "Zoom Out" button in the inspector
    Then the bounding box width and height should increase by approximately 25 percent
    And the center of the bounding box should remain approximately at (12, 12)

  Scenario: Clicking the minimap repositions bounding box center to clicked coordinates
    Given the bounding box is currently at X 0, Y 0, Width 10, Height 10
    When I click on the minimap at asset position (20, 15)
    Then the inspector inputs should reflect X 15, Y 10, Width 10, Height 10
    And the minimap bounding box indicator should be centered at position (20, 15)

  Scenario: Clicking near minimap edge clamps bounding box within asset boundaries
    Given the bounding box is currently at X 0, Y 0, Width 10, Height 10
    When I click on the minimap at asset position (31, 31)
    Then the inspector inputs should reflect X 22, Y 22, Width 10, Height 10

  Scenario: Zoom In button is disabled when at minimum 1x1 dimensions
    Given the bounding box is currently at X 10, Y 10, Width 1, Height 1
    Then the "Zoom In" button in the inspector should be disabled

  Scenario: Zoom Out and Fit to Asset buttons are disabled when fully zoomed out
    Given the bounding box is currently at X 0, Y 0, Width 32, Height 32
    Then the "Zoom Out" button in the inspector should be disabled
    And the "Fit to Asset" button in the inspector should be disabled
