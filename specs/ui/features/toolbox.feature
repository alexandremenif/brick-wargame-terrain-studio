@ui
Feature: Left Toolbox & Palette Interactions

  Background:
    Given the UI is loaded with an active asset of 32 by 32 studs

  Scenario: Default tool and color selection
    Then the active tool mode should be "Brush"
    And the active brush size should be "1x1"
    And an official brick color should be selected by default

  Scenario: Switching between Brush, Eraser, and Pan tools
    When I click the "Eraser" tool button
    Then the active tool mode should be "Eraser"
    When I click the "Pan" tool button
    Then the active tool mode should be "Pan"
    When I click the "Brush" tool button
    Then the active tool mode should be "Brush"

  Scenario Outline: Selecting a brush size preset
    When I select brush size "<size>"
    Then the active brush size should be "<size>"

    Examples:
      | size  |
      | 1x1   |
      | 2x2   |
      | 4x4   |
      | 8x8   |
      | 16x16 |
      | 32x32 |

  Scenario: Selecting an official brick color swatch
    When I select the brick color swatch "Medium Stone Grey"
    Then the selected color should be "Medium Stone Grey" with hex "#A0A5A9"
    And the swatch for "Medium Stone Grey" should show an active visual indicator
