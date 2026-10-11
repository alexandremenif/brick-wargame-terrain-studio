@ui
Feature: Left Toolbox & Palette Interactions

  Background:
    Given the UI is loaded with an active asset of 32 by 32 studs

  Scenario: Default tool and color selection
    Then the active tool mode should be "Brush"
    And the active brush size should be "1x1"
    And an official LEGO color should be selected by default

  Scenario: Switching between Brush and Eraser tools
    When I click the "Eraser" tool button
    Then the active tool mode should be "Eraser"
    When I click the "Brush" tool button
    Then the active tool mode should be "Brush"

  Scenario: Selecting a brush size preset
    When I select brush size "2x2"
    Then the active brush size should be "2x2"
    When I select brush size "4x4"
    Then the active brush size should be "4x4"

  Scenario: Selecting an official LEGO color swatch
    When I select the LEGO color swatch "Medium Stone Grey"
    Then the selected color should be "Medium Stone Grey" with hex "#A0A5A9"
    And the swatch for "Medium Stone Grey" should show an active visual indicator
