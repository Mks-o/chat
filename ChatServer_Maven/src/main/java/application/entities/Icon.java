package application.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@JsonSerialize
public class Icon {
    @JsonProperty("simvol")
    public String simvol;
    @JsonProperty("src")
    public String src;
}
